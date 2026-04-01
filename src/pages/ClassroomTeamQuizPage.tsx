import ClassroomTeamQuizApp from '../features/classroom-team-quiz'

type Props = {
  onBack?: () => void
}

export default function ClassroomTeamQuizPage({ onBack }: Props) {
  return <ClassroomTeamQuizApp onBack={onBack} />
}
