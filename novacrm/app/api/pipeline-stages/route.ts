import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: stages, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('order_num', { ascending: true })

    if (error) {
      console.error('Error fetching pipeline stages:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ stages }, { status: 200 })
  } catch (error) {
    console.error('Unexpected error fetching pipeline stages:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
