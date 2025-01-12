import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User'; // Ensure correct path
import JWT_SECRET_KEY from '../config';

// Signup function
export const signupUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        res.status(400).json({
            error: 'Name, email, and password are required',
        });
        return;
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({
                error: 'User already exists with this email',
            });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET_KEY,
            { expiresIn: '1h' },
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

// Login function
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET_KEY,
            { expiresIn: '1h' },
        );

        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login user' });
    }
};
