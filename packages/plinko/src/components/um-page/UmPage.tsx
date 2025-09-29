import React from 'react';
import { logger as plinkoLogger } from '../../services/logger';

const UmPage: React.FC = () => {
    plinkoLogger.info('👑 [UM] UM page rendered');

    return (
        <div className="um-page">
            <div className="um-content">
                <h1>User Management</h1>
                <p>This is the User Management page for Plinko.</p>
            </div>
        </div>
    );
};

export default UmPage;
