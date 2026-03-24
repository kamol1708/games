import ClassroomTeamQuizApp from '../classroom-team-quiz/App'

type Props = {
  onBack?: () => void
}

export default function ClassroomTeamQuizPage({ onBack }: Props) {
  return <ClassroomTeamQuizApp onBack={onBack} />
}
