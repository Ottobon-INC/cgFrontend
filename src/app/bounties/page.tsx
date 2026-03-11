import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BountiesClient } from './BountiesClient';
import type { Bounty } from '@/types';

export default function BountiesPage() {
    const [bounties, setBounties] = useState<Bounty[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBounties = async () => {
            try {
                const data = await api.bounties.list();
                setBounties(data);
            } catch {
                /* empty */
            } finally {
                setLoading(false);
            }
        };
        fetchBounties();
    }, []);

    if (loading) {
        return <div className="p-10 text-neutral-500">Loading bounties...</div>;
    }

    return (
        <div className="p-10 max-w-[1400px]">
            <BountiesClient initialBounties={bounties} />
        </div>
    );
}
