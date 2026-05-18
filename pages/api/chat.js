export default async function handler(req, res) {
  return res.status(200).json({ 
    content: [{ text: "Hello from Wray Villa! Check in is at 3pm." }] 
  });
}
