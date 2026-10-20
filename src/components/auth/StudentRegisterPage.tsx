import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { Button } from '../common/Button';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const StudentRegisterPage: React.FC = () => {
  const { registerStudent } = useAuth();
  const { settings, departments } = useSystem();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('collegePassword123');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [courseProgramme, setCourseProgramme] = useState('B.Tech / Bachelor of Technology');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allowedDomain = settings.auth_config.allowed_email_domain || '@college.edu';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !studentId.trim() || !email.trim()) {
      setErrorMsg('All fields marked with an asterisk are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerStudent({
        email,
        password,
        fullName,
        studentId,
        department,
        courseProgramme,
      });

      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-brand-700 text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-ink-primary">
          Student Portal Registration
        </h2>
        <p className="text-xs text-ink-secondary">
          Register with your official college credentials.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-border rounded-xl shadow-xs space-y-6">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-ink-primary">Create Student Account</h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Registration is restricted to domain <strong>{allowedDomain}</strong>.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Chen"
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Official College Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`e.g. maya.chen${allowedDomain}`}
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                required
              />
              <p className="text-[11px] text-ink-muted mt-1">
                Must end with <strong>{allowedDomain}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Create Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                  placeholder="AIT-2026-099"
                  className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-ink-primary mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))
                  ) : (
                    <option>Computer Science & Engineering</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Course / Programme
              </label>
              <select
                value={courseProgramme}
                onChange={(e) => setCourseProgramme(e.target.value)}
                className="w-full px-2 py-2 rounded-lg border border-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option>B.Tech / Bachelor of Technology</option>
                <option>M.Tech / Master of Technology</option>
                <option>B.Sc / Bachelor of Science</option>
                <option>Ph.D / Doctoral Research</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Register & Verify Account
            </Button>

            <div className="text-center pt-2 text-ink-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-700 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
