type LogoProps = {
  className?: string;
};

export default function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`text-3xl ${className}`}>
      <i className="fas fa-shield-alt"></i>
    </div>
  );
}
