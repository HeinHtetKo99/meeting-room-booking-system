import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const ROLE_OPTIONS = ["admin", "owner", "user"];

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function formatTimeRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();
  const datePart = (date) =>
    date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timePart = (date) =>
    date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (sameDay) {
    return `${datePart(start)}, ${timePart(start)} – ${timePart(end)}`;
  }
  return `${datePart(start)}, ${timePart(start)} – ${datePart(end)}, ${timePart(end)}`;
}

function getRoleHint(role) {
  if (role === "admin") {
    return "You can manage users, view all bookings, and delete any booking.";
  }
  if (role === "owner") {
    return "You can view bookings grouped by user and delete any booking.";
  }
  return "You can create and view all bookings, but only delete your own.";
}

function App() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [groupedByUser, setGroupedByUser] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [bookingFormError, setBookingFormError] = useState("");
  const [userFormError, setUserFormError] = useState("");
  const [bookingFieldErrors, setBookingFieldErrors] = useState({
    startTime: false,
    endTime: false,
  });
  const [userNameError, setUserNameError] = useState(false);
  const [bookingDeleteDialog, setBookingDeleteDialog] = useState({
    open: false,
    type: null,
    booking: null,
  });
  const [userDeleteDialog, setUserDeleteDialog] = useState({
    open: false,
    user: null,
  });
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    startTime: "",
    endTime: "",
  });

  const [newUserForm, setNewUserForm] = useState({
    name: "",
    role: "user",
  });

  const currentUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [users, selectedUserId],
  );

  const client = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: selectedUserId ? { "x-user-id": selectedUserId } : {},
    });
  }, [selectedUserId]);

  async function request(action) {
    setError(null);
    setMessage("");
    try {
      await action();
    } catch (reqError) {
      const status = reqError.response?.status;
      const serverMessage = reqError.response?.data?.error;
      const details =
        status === 403
          ? "You do not have permission for this action with the selected role."
          : status === 401
            ? "Please select a valid user to continue."
            : null;
      setError({
        message: serverMessage || reqError.message || "Request failed.",
        status,
        details,
      });
    }
  }

  async function loadUsers(forceKeepSelection = true) {
    const response = await client.get("/users");
    setUsers(response.data);
    if (!forceKeepSelection && response.data.length > 0) {
      setSelectedUserId(response.data[0].id);
    }
    return response.data;
  }

  async function loadBookings() {
    setIsLoadingBookings(true);
    try {
      const response = await client.get("/bookings");
      setBookings(response.data);
    } finally {
      setIsLoadingBookings(false);
    }
  }

  async function loadOwnerAdminData() {
    if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      setGroupedByUser([]);
      return;
    }
    const groupedRes = await client.get("/bookings/grouped-by-user");
    setGroupedByUser(groupedRes.data);
  }

  useEffect(() => {
    const bootstrap = async () => {
      const guestClient = axios.create({ baseURL: API_BASE_URL, headers: { "x-user-id": "u1" } });
      const usersRes = await guestClient.get("/users");
      setUsers(usersRes.data);
      setSelectedUserId(usersRes.data[0]?.id || "");
    };
    request(bootstrap);
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      return;
    }
    request(async () => {
      await loadBookings();
    });
  }, [selectedUserId]);

  useEffect(() => {
    request(loadOwnerAdminData);
  }, [currentUser, bookings]);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [bookings],
  );

  const canManageUsers = currentUser?.role === "admin";
  const canViewOwnerData = currentUser?.role === "owner" || currentUser?.role === "admin";

  const handleCreateBooking = (event) => {
    event.preventDefault();
    setBookingFormError("");
    setBookingFieldErrors({ startTime: false, endTime: false });
    if (!bookingForm.startTime || !bookingForm.endTime) {
      setBookingFormError("Start time and end time are required.");
      setBookingFieldErrors({
        startTime: !bookingForm.startTime,
        endTime: !bookingForm.endTime,
      });
      return;
    }
    if (new Date(bookingForm.startTime) >= new Date(bookingForm.endTime)) {
      setBookingFormError("Start time must be earlier than end time.");
      setBookingFieldErrors({ startTime: true, endTime: true });
      return;
    }
    request(async () => {
      await client.post("/bookings", bookingForm);
      setBookingForm({ startTime: "", endTime: "" });
      setMessage("Booking created.");
      await loadBookings();
    });
  };

  function closeBookingDeleteDialog() {
    setBookingDeleteDialog({ open: false, type: null, booking: null });
  }

  function openBookingDeleteDialog(booking) {
    const canDeleteAny = currentUser?.role === "admin" || currentUser?.role === "owner";
    const isOwnBooking = currentUser?.id === booking.userId;

    if (!isOwnBooking && !canDeleteAny) {
      setBookingDeleteDialog({ open: true, type: "forbidden", booking });
      return;
    }

    setBookingDeleteDialog({ open: true, type: "confirm", booking });
  }

  async function confirmBookingDelete() {
    const bookingId = bookingDeleteDialog.booking?.id;
    if (!bookingId) {
      return;
    }
    closeBookingDeleteDialog();
    request(async () => {
      await client.delete(`/bookings/${bookingId}`);
      setMessage("Booking deleted.");
      await loadBookings();
    });
  }

  function openUserDeleteDialog(user) {
    if (currentUser?.id === user.id) {
      return;
    }
    setUserDeleteDialog({ open: true, user });
  }

  function closeUserDeleteDialog() {
    setUserDeleteDialog({ open: false, user: null });
  }

  async function confirmUserDelete() {
    const userId = userDeleteDialog.user?.id;
    if (!userId) {
      return;
    }
    closeUserDeleteDialog();
    request(async () => {
      await client.delete(`/users/${userId}`);
      setMessage("User deleted with their bookings.");
      const refreshedUsers = await loadUsers();
      await loadBookings();
      if (selectedUserId === userId && refreshedUsers.length > 0) {
        setSelectedUserId(refreshedUsers[0].id);
      }
    });
  }

  const handleCreateUser = (event) => {
    event.preventDefault();
    setUserFormError("");
    setUserNameError(false);
    if (!newUserForm.name.trim()) {
      setUserFormError("User name is required.");
      setUserNameError(true);
      return;
    }
    const nameExists = users.some(
      (user) => user.name.toLowerCase() === newUserForm.name.trim().toLowerCase(),
    );
    if (nameExists) {
      setUserFormError("This name is already taken. Please use a different name.");
      setUserNameError(true);
      return;
    }
    request(async () => {
      await client.post("/users", newUserForm);
      setNewUserForm({ name: "", role: "user" });
      setMessage("User created.");
      await loadUsers();
    });
  };

  const handleRoleChange = (userId, role) => {
    request(async () => {
      await client.patch(`/users/${userId}/role`, { role });
      setMessage("User role updated.");
      await loadUsers();
    });
  };

  return (
    <main className="page">
      <header className="hero">
        <div className="hero-text">
          <h1>Meeting Room Booking System</h1>
          <p className="subtitle">Single meeting room · book, view, and manage by role</p>
        </div>
        {currentUser && (
          <div className="user-badge">
            <p className="user-badge-name">{currentUser.name}</p>
            <span className={`role-pill ${currentUser.role}`}>{currentUser.role}</span>
          </div>
        )}
      </header>

      {(message || error) && (
        <div className="toast-stack" aria-live="polite">
          {message && <p className="message ok">{message}</p>}
          {error && (
            <div className="message error">
              {error.message}
              {error.details && <p className="error-details">{error.details}</p>}
            </div>
          )}
        </div>
      )}

      <div className="top-grid">
        <section className="card">
          <h2>
            {currentUser ? (
              <>
                Logged in as {currentUser.name}{" "}
                <span className={`role-tag ${currentUser.role}`}>{currentUser.role}</span>
              </>
            ) : (
              "Login As User"
            )}
          </h2>
          <p className="section-hint">{currentUser ? getRoleHint(currentUser.role) : "Select a user to continue."}</p>
          <label>
            {currentUser ? "Switch user" : "Select user"}
            <select
              value={selectedUserId}
              onChange={(event) => {
                setSelectedUserId(event.target.value);
                setError(null);
                setMessage("");
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="card">
          <h2>Create Booking</h2>
          <p className="section-hint">Pick a start and end time. Overlapping bookings are not allowed.</p>
          <form className="form-grid" onSubmit={handleCreateBooking}>
            <label>
              Start Time
              <input
                type="datetime-local"
                className={bookingFieldErrors.startTime ? "input-error" : ""}
                value={bookingForm.startTime}
                onChange={(event) =>
                  setBookingForm((prev) => ({
                    ...prev,
                    startTime: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              End Time
              <input
                type="datetime-local"
                className={bookingFieldErrors.endTime ? "input-error" : ""}
                value={bookingForm.endTime}
                onChange={(event) =>
                  setBookingForm((prev) => ({
                    ...prev,
                    endTime: event.target.value,
                  }))
                }
                required
              />
            </label>
            <button type="submit" className="btn-primary">
              Create Booking
            </button>
          </form>
          {bookingFormError && <p className="inline-error">{bookingFormError}</p>}
        </section>
      </div>

      <section className="card">
        <h2>All Bookings ({sortedBookings.length})</h2>
        {isLoadingBookings ? (
          <p className="loading-text">Loading bookings…</p>
        ) : sortedBookings.length === 0 ? (
          <p className="empty-state">No bookings yet. Create one using the form above.</p>
        ) : (
          <ul className="booking-list">
            {sortedBookings.map((booking) => {
              const isOwnBooking = currentUser?.id === booking.userId;
              return (
                <li key={booking.id} className={`booking-item${isOwnBooking ? " own" : ""}`}>
                  <div className="booking-info">
                    <p className="booking-when">
                      {formatTimeRange(booking.startTime, booking.endTime)}
                      {isOwnBooking && <span className="own-badge">Yours</span>}
                    </p>
                    <p className="booking-sub">
                      Booked by <strong>{booking.userName}</strong>
                    </p>
                    <p className="booking-ids">
                      <span>Booking ID: {booking.id}</span>
                      <span>User ID: {booking.userId}</span>
                      <span>Created: {formatDate(booking.createdAt)}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="danger-btn"
                    onClick={() => openBookingDeleteDialog(booking)}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {canManageUsers && (
        <section className="card">
          <h2>Admin: User Management</h2>
          <p className="section-hint">Create users, change roles, or delete users and their bookings.</p>
          <form className="form-grid" onSubmit={handleCreateUser}>
            <label>
              Name
              <input
                className={userNameError ? "input-error" : ""}
                value={newUserForm.name}
                onChange={(event) =>
                  setNewUserForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>
            <label>
              Role
              <select
                value={newUserForm.role}
                onChange={(event) =>
                  setNewUserForm((prev) => ({
                    ...prev,
                    role: event.target.value,
                  }))
                }
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </form>
          {userFormError && <p className="inline-error">{userFormError}</p>}

          <div className="admin-table-head">
            <span>Name</span>
            <span>Role</span>
            <span>Actions</span>
          </div>

          <ul className="list admin-list">
            {users.map((user) => (
              <li key={user.id}>
                <div className="admin-name">
                  {user.name} ({user.id})
                </div>
                <div className="admin-role">
                  {currentUser.id === user.id ? (
                    <span className="admin-role-locked" title="You cannot change your own role">
                      {user.role}
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="danger-btn"
                    disabled={currentUser.id === user.id}
                    onClick={() => openUserDeleteDialog(user)}
                  >
                    Delete User
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canViewOwnerData && (
        <section className="card">
          <h2>Bookings Grouped By User</h2>
          <p className="section-hint">Each user&apos;s bookings in one place (owner/admin view).</p>
          {groupedByUser.length === 0 ? (
            <p className="empty-state">No users to display.</p>
          ) : (
            <ul className="grouped-list">
              {groupedByUser.map((group) => (
                <li key={group.userId} className="grouped-block">
                  <div className="grouped-head">
                    <strong>{group.name}</strong>
                    <span className={`role-tag ${group.role}`}>{group.role}</span>
                    <span className="grouped-count">{group.bookings.length} booking(s)</span>
                  </div>
                  {group.bookings.length === 0 ? (
                    <p className="grouped-empty">No bookings</p>
                  ) : (
                    <ul className="grouped-bookings">
                      {group.bookings.map((booking) => (
                        <li key={booking.id}>
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <AlertDialog
        open={bookingDeleteDialog.open && bookingDeleteDialog.type === "forbidden"}
        onOpenChange={(open) => {
          if (!open) {
            closeBookingDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>Cannot delete this booking</AlertDialogTitle>
            <AlertDialogDescription>
              You can only delete your own bookings. This booking belongs to{" "}
              <strong>{bookingDeleteDialog.booking?.userName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>OK</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bookingDeleteDialog.open && bookingDeleteDialog.type === "confirm"}
        onOpenChange={(open) => {
          if (!open) {
            closeBookingDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove booking{" "}
              <strong>{bookingDeleteDialog.booking?.id}</strong> (
              {bookingDeleteDialog.booking
                ? `${formatDate(bookingDeleteDialog.booking.startTime)} - ${formatDate(bookingDeleteDialog.booking.endTime)}`
                : ""}
              ).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="alert-danger-action"
              onClick={confirmBookingDelete}
            >
              Delete booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={userDeleteDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            closeUserDeleteDialog();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{userDeleteDialog.user?.name}</strong> and all bookings they
              created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="alert-danger-action"
              onClick={confirmUserDelete}
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

export default App;
