import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid credentials provided',
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error in login:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to database. Please check your MongoDB configuration.',
        },
        { status: 503 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    const userPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    const token = await createSessionToken(userPayload);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}

