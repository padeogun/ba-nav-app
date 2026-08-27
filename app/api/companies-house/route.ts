import { NextRequest, NextResponse } from 'next/server'

const CH_BASE = 'https://api.company-information.service.gov.uk'

function authHeader() {
  const key = process.env.COMPANIES_HOUSE_API_KEY ?? ''
  return 'Basic ' + Buffer.from(key + ':').toString('base64')
}

export async function GET(req: NextRequest) {
  if (!process.env.COMPANIES_HOUSE_API_KEY) {
    return NextResponse.json({ error: 'COMPANIES_HOUSE_API_KEY not configured' }, { status: 503 })
  }

  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')
  const number = searchParams.get('number')

  let url: string
  if (number) {
    url = `${CH_BASE}/company/${encodeURIComponent(number.trim())}`
  } else if (q) {
    url = `${CH_BASE}/search/companies?q=${encodeURIComponent(q.trim())}&items_per_page=8`
  } else {
    return NextResponse.json({ error: 'Provide q or number param' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: authHeader() },
      next: { revalidate: 300 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Companies House API returned ${res.status}` }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
