import { HomeContainer } from '../containers/HomeContainer'
import { DashboardStoreProvider } from '../providers/DashboardStoreProvider'

export default function Home() {
    return (
        <DashboardStoreProvider>
            <HomeContainer />
        </DashboardStoreProvider>
    )
}
