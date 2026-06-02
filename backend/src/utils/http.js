function sendServiceResult(res, result, successStatus = 200) {
  if (result.error) {
    return res.status(result.error.status).json({ error: result.error.message });
  }
  return res.status(successStatus).json(result.data);
}

module.exports = { sendServiceResult };
