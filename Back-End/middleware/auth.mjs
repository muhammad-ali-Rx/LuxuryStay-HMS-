import User from "../Models/users.mjs";

export const auth = async (req, res, next) => {
  try{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();

  }catch (error){
    console.error("Error during authentication:", error);
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};