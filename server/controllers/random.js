
res.status(200).json(chats);
const q = "SELECT name,profilePic,id FROM users WHERE id=(?)";
db.query(q, [id], (err, data) => {
    console.log(data);
})