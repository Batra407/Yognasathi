import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const reportPath = path.join(process.cwd(), 'ml', 'reports', 'evaluation.json');
    if (!fs.existsSync(reportPath)) {
      return NextResponse.json(
        { status: 'NOT_TRAINED', error: 'No ML evaluation report found on disk.' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(reportPath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to read evaluation report', details: err.message },
      { status: 500 }
    );
  }
}

