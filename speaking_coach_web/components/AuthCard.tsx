type AuthCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition hover:shadow-3xl">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-800">
          {title}
        </h2>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  );
}
