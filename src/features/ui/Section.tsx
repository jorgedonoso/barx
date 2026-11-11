interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function Section({
  title,
  description,
  children,
}: SectionProps) {
  return (
    <section className="mb-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight border-b border-b-purple-300">
          {title}
        </h2>

        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {children}
    </section>
  );
}
