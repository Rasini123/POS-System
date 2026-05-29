import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getInvoiceDetails, updateInvoiceDetails, getInvoiceImage } from '../../actions/POS/invoiceActions';
import { useAuthenticatedImage } from '../../hooks/useAuthenticatedImage';
import { setPosLayout } from '../../actions/uiActions';
const SettingsPage = () => {
    const { darkMode, posLayout } = useSelector(state => state.ui);
    const { user } = useSelector(state => state.auth);
    const { invoiceDetails, invoiceImage, loading, error } = useSelector(state => state.invoice);
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState('sidebar');
    const [selectedLayout, setSelectedLayout] = useState(posLayout || 'tile');
    const [userTypes, setUserTypes] = useState([]);
    const [selectedUserType, setSelectedUserType] = useState('C');
    const [sidebarButtons, setSidebarButtons] = useState([]);
    const [invoiceTemplates, setInvoiceTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('retail');
    const [companyDetails, setCompanyDetails] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');


    const apiImageUrl = invoiceDetails?.ResultSet?.[0]?.IMAGEURL;
    const { imageData: authenticatedLogo } = useAuthenticatedImage(apiImageUrl);


    const availableUserTypes = [
        { id: 'A', name: 'Admin', description: 'Full system access' },
        { id: 'C', name: 'Cashier', description: 'Limited access for point of sale operations' },
    ];


    const defaultTemplates = [
        {
            id: 'retail',
            name: 'Retail Template',
            description: 'Modern retail invoice design',
            fields: {
                showLogo: true,
                showHeader: true,
                showFooter: true,
                showBarcode: true,
                showTaxDetails: false,
                showDiscountBreakdown: true,
                layout: 'vertical',
                showSaving: true
            }
        },
        {
            id: 'minimal',
            name: 'Minimal Template',
            description: 'Clean and simple design',
            fields: {
                showLogo: false,
                showHeader: false,
                showFooter: true,
                showBarcode: false,
                showTaxDetails: true,
                showDiscountBreakdown: false,
                layout: 'vertical',
                showSaving: false
            }
        },
        {
            id: 'detailed',
            name: 'Detailed Template',
            description: 'Comprehensive invoice with all details',
            fields: {
                showLogo: true,
                showHeader: true,
                showFooter: true,
                showBarcode: true,
                showTaxDetails: true,
                showDiscountBreakdown: true,
                layout: 'horizontal',
                showSaving: true
            }
        },
        {
            id: 'compact',
            name: 'Compact Template',
            description: 'Space-efficient for thermal printers',
            fields: {
                showLogo: false,
                showHeader: false,
                showFooter: false,
                showBarcode: true,
                showTaxDetails: false,
                showDiscountBreakdown: false,
                layout: 'compact',
                showSaving: false
            }
        }
    ];

    const allButtons = [
        { id: 'POS', icon: 'fas fa-cash-register', label: 'POS', color: 'bg-green-500', default: true },
        { id: 'INVENTORY', icon: 'fas fa-boxes', label: 'Inventory', color: 'bg-blue-500', default: false },
        { id: 'SUPPLIER', icon: 'fas fa-truck', label: 'Supplier', color: 'bg-amber-500', default: false },
        { id: 'CUSTOMER', icon: 'fas fa-users', label: 'Customer Management', color: 'bg-yellow-600', default: true },
        { id: 'REPORTS', icon: 'fas fa-chart-bar', label: 'Reports', color: 'bg-purple-500', default: true },
        // { id: 'HISTORY', icon: 'fas fa-history', label: 'History', color: 'bg-orange-500', default: true },
        // { id: 'PRINT_INVOICE', icon: 'fas fa-receipt', label: 'Print Invoice', color: 'bg-pink-500', default: true },
        { id: 'RETURNS', icon: 'fas fa-undo', label: 'Returns', color: 'bg-red-500', default: true },
        // { id: 'ADD_PRODUCT', icon: 'fas fa-plus', label: 'Add Products', color: 'bg-indigo-500', default: false },
        { id: 'USER_ACCESS', icon: 'fas fa-user-shield', label: 'User Access', color: 'bg-gray-900', default: false },
        { id: 'SETTINGS', icon: 'fas fa-cog', label: 'Settings', color: 'bg-gray-600', default: false },
        // { id: 'HELP', icon: 'fas fa-question-circle', label: 'Help', color: 'bg-indigo-500', default: true },
    ];


    const defaultCompanyDetails = {
        p_company_name: 'DCSICN CLUB',
        p_phone_number: '070 - 731 4445',
        p_address: 'No. 316/7, Thalangama North, Battaramulla.',
        p_email: '',
        p_website: '',
        p_tax_number: '',
        p_footer_text: 'Thank you for your visit. For any exchange please produce the bill and the garment with the original tag intact within 07 days.',
        p_terms_conditions: 'Goods sold are not returnable. Warranty as per manufacturer terms.',
        IMAGEURL: ''
    };

    useEffect(() => {
        loadSettings();
        dispatch(getInvoiceDetails());
        dispatch(getInvoiceImage());
    }, [dispatch]);

    useEffect(() => {
        if (invoiceDetails && invoiceDetails.ResultSet && invoiceDetails.ResultSet.length > 0) {
            const apiData = invoiceDetails.ResultSet[0];
            setCompanyDetails(prev => ({
                ...prev,
                ...apiData
            }));
        }
    }, [invoiceDetails]);

    useEffect(() => {
        if (authenticatedLogo) {
            setLogoPreview(authenticatedLogo);
        } else if (invoiceDetails?.ResultSet?.[0]?.IMAGEURL) {
            setLogoPreview(invoiceDetails.ResultSet[0].IMAGEURL);
        }
    }, [authenticatedLogo, invoiceDetails]);

    const loadSettings = () => {
        try {
            const savedSettings = localStorage.getItem('sidebarSettings');
            const invoiceSettings = localStorage.getItem('invoiceSettings');

            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                setUserTypes(parsedSettings.userTypes || availableUserTypes);

                if (parsedSettings[selectedUserType]) {
                    setSidebarButtons(
                        allButtons.map(btn => ({
                            ...btn,
                            enabled: parsedSettings[selectedUserType].includes(btn.id)
                        }))
                    );
                } else {
                    setSidebarButtons(allButtons);
                }
            } else {
                setSidebarButtons(allButtons);
                setUserTypes(availableUserTypes);
            }

            if (invoiceSettings) {
                const parsedInvoiceSettings = JSON.parse(invoiceSettings);
                setInvoiceTemplates(parsedInvoiceSettings.templates || defaultTemplates);
                setSelectedTemplate(parsedInvoiceSettings.selectedTemplate || 'retail');

                if (!invoiceDetails || !invoiceDetails.ResultSet) {
                    setCompanyDetails(parsedInvoiceSettings.companyDetails || defaultCompanyDetails);
                }
            } else {
                setInvoiceTemplates(defaultTemplates);
                setSelectedTemplate('retail');
                if (!invoiceDetails || !invoiceDetails.ResultSet) {
                    setCompanyDetails(defaultCompanyDetails);
                }
            }
        } catch (error) {

            setSidebarButtons(allButtons);
            setUserTypes(availableUserTypes);
            setInvoiceTemplates(defaultTemplates);
            setSelectedTemplate('retail');
            setCompanyDetails(defaultCompanyDetails);
        }
    };

    const handleUserTypeChange = (userTypeId) => {
        setSelectedUserType(userTypeId);
        try {
            const savedSettings = localStorage.getItem('sidebarSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                if (parsedSettings[userTypeId]) {
                    setSidebarButtons(
                        allButtons.map(btn => ({
                            ...btn,
                            enabled: parsedSettings[userTypeId].includes(btn.id)
                        }))
                    );
                    return;
                }
            }
            setSidebarButtons(
                allButtons.map(btn => ({
                    ...btn,
                    enabled: userTypeId === 'A' ? true : btn.default
                }))
            );
        } catch (error) {

        }
    };

    const toggleButton = (buttonId) => {
        setSidebarButtons(prevButtons =>
            prevButtons.map(btn =>
                btn.id === buttonId ? { ...btn, enabled: !btn.enabled } : btn
            )
        );
    };

    const handleTemplateChange = (templateId) => {
        setSelectedTemplate(templateId);
    };

    const handleCompanyDetailChange = (field, value) => {
        setCompanyDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, GIF)');
                return;
            }

            setLogoFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        setSaveStatus('');

        try {
            const currentSettings = JSON.parse(localStorage.getItem('sidebarSettings') || '{}');
            const enabledButtons = sidebarButtons
                .filter(btn => btn.enabled)
                .map(btn => btn.id);

            const newSidebarSettings = {
                ...currentSettings,
                [selectedUserType]: enabledButtons,
                userTypes: userTypes
            };

            localStorage.setItem('sidebarSettings', JSON.stringify(newSidebarSettings));


            const newInvoiceSettings = {
                templates: invoiceTemplates,
                selectedTemplate: selectedTemplate,
                companyDetails: companyDetails
            };

            localStorage.setItem('invoiceSettings', JSON.stringify(newInvoiceSettings));


            const updateData = {
                ...companyDetails,
                p_company_name: companyDetails.p_company_name || '',
                p_phone_number: companyDetails.p_phone_number || '',
                p_address: companyDetails.p_address || '',
                p_email: companyDetails.p_email || '',
                p_website: companyDetails.p_website || '',
                p_tax_number: companyDetails.p_tax_number || '',
                p_footer_text: companyDetails.p_footer_text || '',
                p_terms_conditions: companyDetails.p_terms_conditions || '',
            };
            await dispatch(updateInvoiceDetails(updateData, logoFile));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {

            setSaveStatus('error');
        }
        setSaving(false);
    };

    const resetToDefaults = () => {
        const defaultSidebarSettings = {
            A: allButtons.map(btn => btn.id),
            C: allButtons.filter(btn => btn.default).map(btn => btn.id),
            userTypes: availableUserTypes
        };

        const defaultInvoiceSettings = {
            templates: defaultTemplates,
            selectedTemplate: 'retail',
            companyDetails: defaultCompanyDetails
        };

        localStorage.setItem('sidebarSettings', JSON.stringify(defaultSidebarSettings));
        localStorage.setItem('invoiceSettings', JSON.stringify(defaultInvoiceSettings));
        loadSettings();
    };

    const TemplatePreview = ({ template }) => {
        return (
            <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                onClick={() => handleTemplateChange(template.id)}
            >
                <div className="flex items-center mb-3">
                    <div className={`w-3 h-3 rounded-full mr-3 ${selectedTemplate === template.id ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                    <h3 className="font-medium">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                <div className="bg-gray-100 dark:bg-gray-600 h-20 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">Template Preview</span>
                </div>
            </div>
        );
    };

    if (!user || user.userType !== 'A') {
        return (
            <div className={`flex items-center justify-center h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="text-center p-8 rounded-lg shadow-lg max-w-md">
                    <i className="fas fa-lock text-5xl mb-4 text-red-500"></i>
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p>You need administrator privileges to access the settings page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-6 h-full overflow-y-auto ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">System Settings</h1>
                        <p className="mt-2 text-gray-500">Configure system preferences and invoice templates</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={resetToDefaults}
                            className={`px-4 py-2 rounded-lg font-medium ${darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                } transition-colors`}
                        >
                            Reset Defaults
                        </button>
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className={`px-4 py-2 rounded-lg font-medium text-white ${saving
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                                } transition-colors flex items-center`}
                        >
                            {saving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-2"></i>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                    <button
                        onClick={() => setActiveTab('sidebar')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'sidebar'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <i className="fas fa-bars mr-2"></i>
                        Sidebar Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('invoice')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'invoice'
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <i className="fas fa-receipt mr-2"></i>
                        Invoice Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('pos-interface')}
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'pos-interface'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <i className="fas fa-desktop mr-2"></i>
                        POS Interface
                    </button>
                </div>

                {saveStatus === 'success' && (
                    <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200 dark:bg-green-900 dark:text-green-200">
                        <i className="fas fa-check-circle mr-2"></i>
                        Settings saved successfully!
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900 dark:text-red-200">
                        <i className="fas fa-exclamation-circle mr-2"></i>
                        Error saving settings. Please try again.
                    </div>
                )}

                {loading && (
                    <div className="mb-6 p-3 bg-blue-100 text-blue-700 rounded-lg border border-blue-200 dark:bg-blue-900 dark:text-blue-200">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Loading invoice details...
                    </div>
                )}

                {/* {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900 dark:text-red-200">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Error loading invoice details: {error.message}
          </div>
        )} */}

                {/* Sidebar Settings Tab */}
                {activeTab === 'sidebar' && (
                    <>
                        <div className={`rounded-xl shadow-md overflow-hidden mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold">User Role Selection</h2>
                                <p className="text-sm text-gray-500 mt-1">Select a user role to configure its sidebar permissions</p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userTypes.map(userType => (
                                        <div
                                            key={userType.id}
                                            onClick={() => handleUserTypeChange(userType.id)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedUserType === userType.id
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                } ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${selectedUserType === userType.id ? 'bg-blue-500' : 'bg-gray-400'
                                                    }`}></div>
                                                <h3 className="font-medium">{userType.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">{userType.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold">
                                    Sidebar Permissions for {userTypes.find(ut => ut.id === selectedUserType)?.name || 'Selected Role'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Toggle visibility of sidebar items for this user role
                                </p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {sidebarButtons.map(button => (
                                        <div
                                            key={button.id}
                                            className={`p-4 rounded-lg border transition-all ${button.enabled
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${button.color} text-white`}>
                                                    <i className={button.icon}></i>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={button.enabled}
                                                        onChange={() => toggleButton(button.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full peer ${darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                        } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${button.enabled ? 'peer-checked:bg-blue-600' : ''
                                                        }`}></div>
                                                </label>
                                            </div>
                                            <h3 className="font-medium text-sm">{button.label}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {button.enabled ? 'Visible' : 'Hidden'} in sidebar
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Invoice Settings Tab */}
                {activeTab === 'invoice' && (
                    <div className="space-y-8">
                        {/* Template Selection */}
                        <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold">Invoice Template</h2>
                                <p className="text-sm text-gray-500 mt-1">Choose and customize your invoice design</p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {invoiceTemplates.map(template => (
                                        <TemplatePreview key={template.id} template={template} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Company Details */}
                        <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold">Company Information</h2>
                                <p className="text-sm text-gray-500 mt-1">Update your company details for invoices (Loaded from API)</p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Logo Upload */}
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">Company Logo</label>
                                        <div className="flex items-center space-x-4">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Company Logo" className="w-16 h-16 object-contain border rounded" />
                                            ) : (
                                                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                    <i className="fas fa-image text-gray-400"></i>
                                                </div>
                                            )}
                                            <div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Recommended: 200x60 pixels, PNG or JPG</p>
                                                {authenticatedLogo && (
                                                    <p className="text-xs text-green-500 mt-1">
                                                        <i className="fas fa-check mr-1"></i>
                                                        Logo loaded from API with authentication
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Company Details Form */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            value={companyDetails.p_company_name || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_company_name', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            value={companyDetails.p_phone_number || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_phone_number', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">Address</label>
                                        <textarea
                                            value={companyDetails.p_address || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_address', e.target.value)}
                                            rows={2}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={companyDetails.p_email || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_email', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Website</label>
                                        <input
                                            type="url"
                                            value={companyDetails.p_website || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_website', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Tax Number</label>
                                        <input
                                            type="text"
                                            value={companyDetails.p_tax_number || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_tax_number', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">Footer Text</label>
                                        <input
                                            type="text"
                                            value={companyDetails.p_footer_text || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_footer_text', e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-2">Terms & Conditions</label>
                                        <textarea
                                            value={companyDetails.p_terms_conditions || ''}
                                            onChange={(e) => handleCompanyDetailChange('p_terms_conditions', e.target.value)}
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Template Customization */}
                        <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-semibold">Template Options</h2>
                                <p className="text-sm text-gray-500 mt-1">Customize the appearance of your selected template</p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {invoiceTemplates.find(t => t.id === selectedTemplate)?.fields &&
                                        Object.entries(invoiceTemplates.find(t => t.id === selectedTemplate).fields).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={() => {
                                                            const updatedTemplates = invoiceTemplates.map(template =>
                                                                template.id === selectedTemplate
                                                                    ? {
                                                                        ...template,
                                                                        fields: {
                                                                            ...template.fields,
                                                                            [key]: !value
                                                                        }
                                                                    }
                                                                    : template
                                                            );
                                                            setInvoiceTemplates(updatedTemplates);
                                                        }}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full peer ${darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                        } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${value ? 'peer-checked:bg-blue-600' : ''
                                                        }`}></div>
                                                </label>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* POS Interface Tab */}
                {activeTab === 'pos-interface' && (
                    <div className={`rounded-xl shadow-md overflow-hidden mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold dark:text-white">POS Interface Design</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Choose how the POS screen is displayed for cashiers. Changes apply immediately after saving.
                            </p>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Tile Version */}
                                <div
                                    onClick={() => setSelectedLayout('tile')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${selectedLayout === 'tile'
                                            ? darkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50'
                                            : darkMode ? 'border-gray-600 bg-gray-700/40 hover:border-gray-500' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    {/* Preview */}
                                    <div className={`rounded-lg border mb-3 h-32 flex gap-1.5 p-1.5 ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-200 bg-gray-100'}`}>
                                        {/* Products grid side */}
                                        <div className={`flex-1 rounded-lg flex flex-col gap-1 p-1.5 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                            <div className={`h-2 rounded w-3/4 ${darkMode ? 'bg-gray-500' : 'bg-gray-200'}`}></div>
                                            <div className="grid grid-cols-3 gap-1 flex-1 mt-1">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className={`rounded-md ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Cart side panel */}
                                        <div className={`w-14 rounded-lg flex flex-col gap-1 p-1.5 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                            <div className={`h-2 rounded ${darkMode ? 'bg-gray-500' : 'bg-gray-200'}`}></div>
                                            <div className="flex-1 space-y-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className={`h-2 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                                                ))}
                                            </div>
                                            <div className={`h-3 rounded ${darkMode ? 'bg-green-700' : 'bg-green-400'}`}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tile Version</p>
                                            <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Product tiles grid on the left, cart panel on the right. Best for browsing products visually.
                                            </p>
                                        </div>
                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLayout === 'tile' ? 'border-green-500' : darkMode ? 'border-gray-500' : 'border-gray-300'
                                            }`}>
                                            {selectedLayout === 'tile' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                                        </div>
                                    </div>
                                    {selectedLayout === 'tile' && (
                                        <div className="mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
                                            <i className="fas fa-check-circle"></i> Currently selected
                                        </div>
                                    )}
                                </div>

                                {/* Cart Focus Version */}
                                <div
                                    onClick={() => setSelectedLayout('cart-focus')}
                                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${selectedLayout === 'cart-focus'
                                            ? darkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50'
                                            : darkMode ? 'border-gray-600 bg-gray-700/40 hover:border-gray-500' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                        }`}
                                >
                                    {/* Preview */}
                                    <div className={`rounded-lg border mb-3 h-32 flex flex-col gap-1.5 p-1.5 ${darkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-200 bg-gray-100'}`}>
                                        <div className={`rounded-lg p-1.5 flex gap-1 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                            <div className={`flex-1 h-4 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                                            <div className={`flex-1 h-4 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <div className={`flex-1 rounded-lg p-1.5 flex flex-col gap-1 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className={`h-3 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                                            ))}
                                            <div className="flex-1"></div>
                                            <div className={`h-4 rounded ${darkMode ? 'bg-green-700' : 'bg-green-400'}`}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Cart Focus</p>
                                            <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Full-screen cart with scan &amp; search at top. Best for barcode scanning workflows.
                                            </p>
                                        </div>
                                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLayout === 'cart-focus' ? 'border-green-500' : darkMode ? 'border-gray-500' : 'border-gray-300'
                                            }`}>
                                            {selectedLayout === 'cart-focus' && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                                        </div>
                                    </div>
                                    {selectedLayout === 'cart-focus' && (
                                        <div className="mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
                                            <i className="fas fa-check-circle"></i> Currently selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    dispatch(setPosLayout(selectedLayout));
                                    setSaveStatus('success');
                                    setTimeout(() => setSaveStatus(''), 3000);
                                }}
                                className="mt-6 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
                            >
                                <i className="fas fa-save"></i>
                                Apply Interface
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Changes will take effect immediately after saving.</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
