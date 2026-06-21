async function testHamsterImage() {
  const url = "http://localhost:5173/animals/hamster/01ab2d2ea6.jpg";
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`Status: ${res.status} (${res.statusText})`);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
testHamsterImage();
