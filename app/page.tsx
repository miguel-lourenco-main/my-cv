import { redirect } from 'next/navigation'

/**
 * Root page component that redirects to default locale.
 * Handles requests to the root path by redirecting to /en/.
 * 
 * @returns Redirect to default locale
 */
export default function RootRedirect() {
  redirect('/en/')
}