import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AverageScoreCardProps {
  averageScore: number
}

export function AverageScoreCard({ averageScore }: AverageScoreCardProps) {
  return (
    <Card className="shadow-sm bg-white border-2 border-gray-300">
      <CardHeader className="p-3">
        <CardTitle className="text-lg font-bold text-center">Average Score</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-3xl font-bold text-center">{averageScore.toFixed(2)}</p>
      </CardContent>
    </Card>
  )
}

