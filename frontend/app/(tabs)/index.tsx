import { useLocalSearchParams } from 'expo-router';
import { NavigationProvider } from '../contexts/NavigationContext';
import { UserProvider } from '../contexts/UserContext';
import AppContainer from '../AppContainer';

export default function TabsIndex() {
	const { tab } = useLocalSearchParams();
	return (
		<NavigationProvider initialScreen={tab as string || 'Home'}>
			<UserProvider>
				<AppContainer />
			</UserProvider>
		</NavigationProvider>
	);
}
