import { useEffect, useMemo, useState } from 'react';
import {
  getAdminChildren,
  getAdminParents,
  type AdminChild,
  type AdminParent,
} from '../lib/api';

type AdminDashboardProps = {
  token: string;
  adminName: string;
  onLogout: () => void;
};

type AdminTab = 'parents' | 'children';

export default function AdminDashboard({
  token,
  adminName,
  onLogout,
}: AdminDashboardProps) {
  const [parents, setParents] = useState<AdminParent[]>([]);
  const [children, setChildren] = useState<AdminChild[]>([]);
  const [tab, setTab] = useState<AdminTab>('parents');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [parentRows, childRows] = await Promise.all([
        getAdminParents(token),
        getAdminChildren(token),
      ]);

      setParents(parentRows);
      setChildren(childRows);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load administrator data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredParents = useMemo(() => {
    if (!normalizedSearch) {
      return parents;
    }

    return parents.filter((parent) =>
      [
        parent.display_name,
        parent.email,
        parent.role,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [parents, normalizedSearch]);

  const filteredChildren = useMemo(() => {
    if (!normalizedSearch) {
      return children;
    }

    return children.filter((child) =>
      [
        child.display_name,
        child.login_name,
        child.parent_name,
        child.parent_email,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [children, normalizedSearch]);

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <span>Connected administrator</span>
          <h1>{adminName}</h1>
        </div>

        <button
          type="button"
          className="admin-sign-out"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-dashboard-title">
          <div>
            <span className="admin-badge">SASA Admin</span>
            <h2>Family Accounts</h2>
            <p>
              View every parent and child stored in the
              SARA Tube database.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="admin-summary-grid">
          <article>
            <span>Total parents</span>
            <strong>{parents.length}</strong>
          </article>

          <article>
            <span>Total children</span>
            <strong>{children.length}</strong>
          </article>

          <article>
            <span>Administrators</span>
            <strong>
              {
                parents.filter(
                  (parent) => parent.role === 'admin',
                ).length
              }
            </strong>
          </article>
        </div>

        <div className="admin-toolbar">
          <div className="admin-tabs">
            <button
              type="button"
              className={tab === 'parents' ? 'active' : ''}
              onClick={() => setTab('parents')}
            >
              Parents
            </button>

            <button
              type="button"
              className={tab === 'children' ? 'active' : ''}
              onClick={() => setTab('children')}
            >
              Children
            </button>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={
              tab === 'parents'
                ? 'Search parents...'
                : 'Search children...'
            }
          />
        </div>

        {error && (
          <div className="admin-error">
            <strong>Unable to load data</strong>
            <p>{error}</p>

            <button type="button" onClick={loadData}>
              Try Again
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="admin-loading">
            Loading administrator data...
          </div>
        )}

        {!error && !loading && tab === 'parents' && (
          <div className="admin-table-card">
            <table>
              <thead>
                <tr>
                  <th>Parent</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Children</th>
                </tr>
              </thead>

              <tbody>
                {filteredParents.map((parent) => (
                  <tr key={`admin-parent-${parent.id}`}>
                    <td>
                      <div className="admin-person">
                        <span>
                          {parent.display_name
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>

                        <strong>{parent.display_name}</strong>
                      </div>
                    </td>

                    <td>{parent.email}</td>

                    <td>
                      <span
                        className={
                          parent.role === 'admin'
                            ? 'admin-role admin-role-admin'
                            : 'admin-role'
                        }
                      >
                        {parent.role}
                      </span>
                    </td>

                    <td>{parent.child_count}</td>
                  </tr>
                ))}

                {filteredParents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="admin-empty">
                      No matching parent accounts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!error && !loading && tab === 'children' && (
          <div className="admin-table-card">
            <table>
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Age</th>
                  <th>Login name</th>
                  <th>Parent</th>
                  <th>Parent email</th>
                </tr>
              </thead>

              <tbody>
                {filteredChildren.map((child) => (
                  <tr key={`admin-child-${child.id}`}>
                    <td>
                      <div className="admin-person">
                        <span>⭐</span>
                        <strong>{child.display_name}</strong>
                      </div>
                    </td>

                    <td>{child.age ?? '—'}</td>
                    <td>{child.login_name || '—'}</td>
                    <td>{child.parent_name || '—'}</td>
                    <td>{child.parent_email || '—'}</td>
                  </tr>
                ))}

                {filteredChildren.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No matching child profiles.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
