import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = registerSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid input data',
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parseResult.data;

    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error in registration:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to database. Please check your MongoDB configuration.',
        },
        { status: 503 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email address already exists',
        },
        { status: 409 }
      );
    }

    // Hash password and save new user
    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
    });

    const userPayload = {
      userId: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    };

    const token = await createSessionToken(userPayload);
    await setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

