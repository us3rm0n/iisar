export type NavIcon = 'map' | 'dashboard' | 'admin' | 'login';

export type NavItem = {
	href: string;
	label: string;
	icon: NavIcon;
	/** Emphasised call to action (filled pill). */
	primary?: boolean;
};

type NavContext = {
	user: { id: string } | null;
	role: string | null;
};

/** Header navigation entries for the current visitor, in display order. */
export function navItemsFor({ user, role }: NavContext): NavItem[] {
	const items: NavItem[] = [{ href: '/ecuador', label: 'Ecuador', icon: 'map' }];

	if (user) {
		items.push({ href: '/dashboard', label: 'Mi perfil', icon: 'dashboard' });
		if (role === 'webmaster') items.push({ href: '/admin', label: 'Admin', icon: 'admin' });
	} else {
		// One entry point: registration is linked from the login page.
		items.push({ href: '/auth/login', label: 'Iniciar sesión', icon: 'login', primary: true });
	}

	return items;
}
