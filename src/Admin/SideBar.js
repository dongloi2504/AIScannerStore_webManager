import React, { useState } from 'react';
import { BsArrowLeftShort } from 'react-icons/bs';
import { Link } from "react-router-dom";
import './StoreManagement.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className='store-management-container'>
            <aside className='sidebar' style={{width: isOpen? "250px":"50px"}}>
                <div className='top-section'>
                    <div className="brand" style={{display: isOpen? "block":"none"}}>SMARTSTORE</div>
                    <div className='arrow' onClick={toggleSidebar}>
                        <BsArrowLeftShort style={{ transform: !isOpen && "rotate(180deg" }} />
                    </div>
                </div>
                <div className="name_after_brand"  style={{display: isOpen? "block":"none"}}>
                  <Link to="/store-management">Admin Page</Link>
                </div>
                <div className="name_after_brand"  style={{display: isOpen? "block":"none"}}>
                <Link to="/manager-management">Manager Page</Link>
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;