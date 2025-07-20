'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button, Input, Textarea } from '@/components/ui'
import { useAuth } from '@/context'
import {
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Globe,
  CreditCard,
  Mail,
  Database,
  Key,
  User,
  Palette,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    phoneNumber: string
    address: string
  }
  appearance: {
    primaryColor: string
    logoUrl: string
    faviconUrl: string
    theme: 'light' | 'dark' | 'auto'
  }
  notifications: {
    emailNotifications: boolean
    orderNotifications: boolean
    lowStockAlerts: boolean
    marketingEmails: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
  }
  payment: {
    stripeEnabled: boolean
    paypalEnabled: boolean
    applePayEnabled: boolean
    currency: string
    taxRate: number
  }
  shipping: {
    freeShippingThreshold: number
    defaultShippingCost: number
    shippingZones: Array<{
      name: string
      cost: number
      countries: string[]
    }>
  }
}

const AdminSettings: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security' | 'payment' | 'shipping'>('general')

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/settings')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    fetchSettings()
  }, [user, isAuthenticated, isLoading, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Settings saved successfully')
      } else {
        toast.error(data.message || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (section: keyof SiteSettings, field: string, value: any) => {
    if (!settings) return

    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }
    })
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'shipping', name: 'Shipping', icon: Globe },
  ]

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your store configuration and preferences
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button onClick={fetchSettings} variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button onClick={saveSettings} loading={saving} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {settings ? (
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Site Name"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                        placeholder="Enter site name"
                      />
                      <Input
                        label="Contact Email"
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                        placeholder="Enter contact email"
                      />
                      <Input
                        label="Phone Number"
                        value={settings.general.phoneNumber}
                        onChange={(e) => updateSetting('general', 'phoneNumber', e.target.value)}
                        placeholder="Enter phone number"
                      />
                      <Input
                        label="Address"
                        value={settings.general.address}
                        onChange={(e) => updateSetting('general', 'address', e.target.value)}
                        placeholder="Enter address"
                      />
                      <div className="md:col-span-2">
                        <Textarea
                          label="Site Description"
                          value={settings.general.siteDescription}
                          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                          placeholder="Enter site description"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Primary Color"
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={settings.appearance.theme}
                          onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      <Input
                        label="Logo URL"
                        value={settings.appearance.logoUrl}
                        onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
                        placeholder="Enter logo URL"
                      />
                      <Input
                        label="Favicon URL"
                        value={settings.appearance.faviconUrl}
                        onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
                        placeholder="Enter favicon URL"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Order Notifications</h4>
                          <p className="text-sm text-gray-500">Get notified about new orders</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderNotifications}
                          onChange={(e) => updateSetting('notifications', 'orderNotifications', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Low Stock Alerts</h4>
                          <p className="text-sm text-gray-500">Get notified when products are low in stock</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.lowStockAlerts}
                          onChange={(e) => updateSetting('notifications', 'lowStockAlerts', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                          <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.marketingEmails}
                          onChange={(e) => updateSetting('notifications', 'marketingEmails', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="5"
                          max="1440"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Password Policy</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Minimum Length
                            </label>
                            <input
                              type="number"
                              value={settings.security.passwordPolicy.minLength}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                minLength: parseInt(e.target.value)
                              })}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="6"
                              max="50"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Require Uppercase Letters</span>
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy.requireUppercase}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                requireUppercase: e.target.checked
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Require Numbers</span>
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy.requireNumbers}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                requireNumbers: e.target.checked
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Require Symbols</span>
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy.requireSymbols}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                requireSymbols: e.target.checked
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Payment Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Stripe Payments</h4>
                          <p className="text-sm text-gray-500">Enable Stripe payment processing</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.payment.stripeEnabled}
                          onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">PayPal Payments</h4>
                          <p className="text-sm text-gray-500">Enable PayPal payment processing</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.payment.paypalEnabled}
                          onChange={(e) => updateSetting('payment', 'paypalEnabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Apple Pay</h4>
                          <p className="text-sm text-gray-500">Enable Apple Pay for mobile users</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.payment.applePayEnabled}
                          onChange={(e) => updateSetting('payment', 'applePayEnabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            value={settings.payment.currency}
                            onChange={(e) => updateSetting('payment', 'currency', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD (C$)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            value={settings.payment.taxRate}
                            onChange={(e) => updateSetting('payment', 'taxRate', parseFloat(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Shipping Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Free Shipping Threshold ($)
                        </label>
                        <input
                          type="number"
                          value={settings.shipping.freeShippingThreshold}
                          onChange={(e) => updateSetting('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Shipping Cost ($)
                        </label>
                        <input
                          type="number"
                          value={settings.shipping.defaultShippingCost}
                          onChange={(e) => updateSetting('shipping', 'defaultShippingCost', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Shipping Zones</h4>
                      <div className="space-y-4">
                        {settings.shipping.shippingZones.map((zone, index) => (
                          <div key={index} className="border border-gray-200 rounded-md p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <input
                                type="text"
                                value={zone.name}
                                onChange={(e) => {
                                  const newZones = [...settings.shipping.shippingZones]
                                  newZones[index].name = e.target.value
                                  updateSetting('shipping', 'shippingZones', newZones)
                                }}
                                placeholder="Zone name"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="number"
                                value={zone.cost}
                                onChange={(e) => {
                                  const newZones = [...settings.shipping.shippingZones]
                                  newZones[index].cost = parseFloat(e.target.value)
                                  updateSetting('shipping', 'shippingZones', newZones)
                                }}
                                placeholder="Shipping cost"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                              />
                              <input
                                type="text"
                                value={zone.countries.join(', ')}
                                onChange={(e) => {
                                  const newZones = [...settings.shipping.shippingZones]
                                  newZones[index].countries = e.target.value.split(',').map(c => c.trim())
                                  updateSetting('shipping', 'shippingZones', newZones)
                                }}
                                placeholder="Countries (comma-separated)"
                                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          onClick={() => {
                            const newZones = [...settings.shipping.shippingZones, {
                              name: '',
                              cost: 0,
                              countries: []
                            }]
                            updateSetting('shipping', 'shippingZones', newZones)
                          }}
                          variant="secondary"
                        >
                          Add Shipping Zone
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Settings Data</h3>
              <p className="text-gray-500">Settings data will appear here once available.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings 