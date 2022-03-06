import Link from 'next/link'
import { Callout } from 'react-foundation'

export default function Index() {
    return (
        <div>
            <Link href="/schedule">Schedule</Link>
            <br />
            <Link href="/courses">Courses</Link>
        </div>
    )
}