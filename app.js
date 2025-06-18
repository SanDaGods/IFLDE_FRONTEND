async function callBackend() {
  try {
    const response = await fetch(`${window.BACKEND_URL}/api/test`, {
      credentials: "include",
    });
    console.log(await response.json());
  } catch (err) {
    console.error("Backend error:", err);
  }
}