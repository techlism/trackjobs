import { validateRequest } from '@/lib/lucia';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { session } = await validateRequest();
        return NextResponse.json({ 
            isAuthenticated: !!session 
        }, { 
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': 'chrome-extension://*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true'
            }
        });
    } catch (error) {
        console.error('Authentication check failed:', error);
        return NextResponse.json({ 
            isAuthenticated: false,
            error: 'Authentication check failed'
        }, { 
            status: 500 
        });
    }
}

export async function OPTIONS(request: NextRequest) {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': 'chrome-extension://*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': 'true'
        }
    });
}