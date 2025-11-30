import { NextRequest, NextResponse } from 'next/server';
import { validateAdmin } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = validateAdmin(username, password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In a real app, you would generate a JWT token here
    return NextResponse.json(
      { 
        success: true, 
        message: 'Authentication successful',
        // token: generateJWT(username) // Would generate JWT in real app
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
