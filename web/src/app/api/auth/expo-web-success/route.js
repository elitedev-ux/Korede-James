import { getToken } from '@auth/core/jwt';
export async function GET(request) {
	const isSecure = process.env.AUTH_URL?.startsWith('https') ?? request.url?.startsWith('https') ?? false;
	const targetOrigin = safeTargetOrigin(request);
	const [token, jwt] = await Promise.all([
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: isSecure,
			raw: true,
		}),
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: isSecure,
		}),
	]);

	if (!jwt) {
		return new Response(
			`
			<html>
				<body>
					<script>
						window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, ${JSON.stringify(targetOrigin)});
					</script>
				</body>
			</html>
			`,
			{
				status: 401,
				headers: {
					'Content-Type': 'text/html',
					...securityHeaders(),
				},
			}
		);
	}

	const message = {
		type: 'AUTH_SUCCESS',
		jwt: token,
		user: {
			id: jwt.sub,
			email: jwt.email,
			name: jwt.name,
		},
	};

	return new Response(
		`
		<html>
			<body>
				<script>
					window.parent.postMessage(${JSON.stringify(message)}, ${JSON.stringify(targetOrigin)});
				</script>
			</body>
		</html>
		`,
		{
			headers: {
				'Content-Type': 'text/html',
				...securityHeaders(),
			},
		}
	);
}

function safeTargetOrigin(request) {
	return (
		process.env.PUBLIC_SITE_URL ||
		process.env.AUTH_URL ||
		new URL(request.url).origin
	).replace(/\/$/, '');
}

function securityHeaders() {
	return {
		'Cache-Control': 'no-store',
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'Referrer-Policy': 'no-referrer',
	};
}
