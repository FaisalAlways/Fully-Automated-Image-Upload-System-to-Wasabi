import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const verifyEmailSchema = z.object({
  token: z.string().nonempty("Token is required"),
});

export const validateVerifyEmail = (req: Request, res: Response, next: NextFunction) => {
  try {
    verifyEmailSchema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues[0].message });
    }
    next(err);
  }
};
