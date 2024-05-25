export function checkFileExists(path) {
  return new Promise((resolve, reject) => {
    fetch(path, {
      method: "HEAD", // Send HEAD request to check existence without downloading
      cache: "no-cache", // Avoid caching HEAD request
    })
      .then((response) => resolve(response.ok)) // File exists if response is OK (200)
      .catch((error) => resolve(false)); // File doesn't exist or server error
  });
}
