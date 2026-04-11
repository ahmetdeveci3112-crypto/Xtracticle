async function run() {
  const res = await fetch('https://api.fxtwitter.com/status/2042794694560879061');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
