'use client'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts'

export default function RadarPanel({ data }: { data: { subject: string; score: number; fullMark: number }[] }) {
  if (!data.length || data.every((d) => d.score === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px' }}>
        <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Complete the Temperament assessment to see your profile.</p>
      </div>
    )
  }
  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted)' }} />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar dataKey="score" stroke="var(--teal)" fill="var(--teal)" fillOpacity={0.35} />
          <Tooltip
            formatter={(v) => [`${v}/5`, 'Score']}
            contentStyle={{ fontFamily: 'var(--mono)', fontSize: '11px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '2px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
