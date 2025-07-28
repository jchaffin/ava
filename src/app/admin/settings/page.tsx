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
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SiteSettings {
  general: {
    siteName: string
    siteDescription: string
    contactEmail: string
    phoneNumber: string
    address: string
    socialMedia: {
      facebook: string
      instagram: string
      twitter: string
      youtube: string
      tiktok: string
      linkedin: string
    }
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
    adminEmail: string
    adminName: string
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSymbols: boolean
    }
  }
  payment: {
    stripeEnabled: boolean
    stripePublishableKey: string
    stripeSecretKey: string
    paypalEnabled: boolean
    paypalClientId: string
    paypalSecret: string
    applePayEnabled: boolean
    applePayMerchantId: string
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
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security' | 'payment' | 'shipping'>('general')
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showStripeKeys, setShowStripeKeys] = useState({
    publishable: false,
    secret: false
  })

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

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    try {
      setChangingPassword(true)
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const updateSetting = (section: keyof SiteSettings, field: string, value: string | number | boolean | object) => {
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

    // Update user name in real-time when admin name is changed
    if (section === 'security' && field === 'adminName' && typeof value === 'string') {
      updateProfile({ name: value })
    }
  }

  const updateSocialMedia = (platform: string, value: string) => {
    if (!settings) return

    setSettings(prev => {
      if (!prev) return prev
      return {
        ...prev,
        general: {
          ...prev.general,
          socialMedia: {
            ...prev.general.socialMedia,
            [platform]: value,
          },
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
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ava-accent mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="bg-theme-secondary shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Settings</h1>
                <p className="mt-1 text-sm text-theme-muted">
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
            <div className="bg-theme-secondary rounded-lg shadow border border-theme">
              {/* Tabs */}
              <div className="border-b border-theme">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'general' | 'appearance' | 'notifications' | 'security' | 'payment' | 'shipping')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-ava-accent text-ava-accent'
                            : 'border-transparent text-theme-muted hover:text-theme-primary hover:border-theme'
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
              <div className="p-6 bg-theme-primary">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-theme-primary">General Settings</h3>
                    
                    {/* Basic Information */}
                    <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                      <h4 className="text-md font-medium text-theme-primary">Basic Information</h4>
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

                    {/* Social Media Links */}
                    <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                      <h4 className="text-md font-medium text-theme-primary">Social Media Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Facebook URL"
                          value={settings.general.socialMedia?.facebook || ''}
                          onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                        />
                        <Input
                          label="Instagram URL"
                          value={settings.general.socialMedia?.instagram || ''}
                          onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                          placeholder="https://instagram.com/yourpage"
                        />
                        <Input
                          label="Twitter/X URL"
                          value={settings.general.socialMedia?.twitter || ''}
                          onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                          placeholder="https://twitter.com/yourpage"
                        />
                        <Input
                          label="YouTube URL"
                          value={settings.general.socialMedia?.youtube || ''}
                          onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                          placeholder="https://youtube.com/yourchannel"
                        />
                        <Input
                          label="TikTok URL"
                          value={settings.general.socialMedia?.tiktok || ''}
                          onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                          placeholder="https://tiktok.com/@yourpage"
                        />
                        <Input
                          label="LinkedIn URL"
                          value={settings.general.socialMedia?.linkedin || ''}
                          onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/company/yourcompany"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-theme-primary">Appearance Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Primary Color"
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                      />
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
                    <h3 className="text-lg font-medium text-theme-primary">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Email Notifications</h4>
                          <p className="text-sm text-theme-muted">Receive notifications via email</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Order Notifications</h4>
                          <p className="text-sm text-theme-muted">Get notified about new orders</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.orderNotifications}
                          onChange={(e) => updateSetting('notifications', 'orderNotifications', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Low Stock Alerts</h4>
                          <p className="text-sm text-theme-muted">Get notified when products are low in stock</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.lowStockAlerts}
                          onChange={(e) => updateSetting('notifications', 'lowStockAlerts', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Marketing Emails</h4>
                          <p className="text-sm text-theme-muted">Receive marketing and promotional emails</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.marketingEmails}
                          onChange={(e) => updateSetting('notifications', 'marketingEmails', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-theme-primary">Security Settings</h3>
                    <div className="space-y-6">
                      {/* Admin Account Settings */}
                      <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                        <h4 className="text-sm font-medium text-theme-primary">Admin Account</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Admin Name"
                            type="text"
                            value={settings.security.adminName || ''}
                            onChange={(e) => updateSetting('security', 'adminName', e.target.value)}
                            placeholder="Enter admin name"
                          />
                          <Input
                            label="Admin Email"
                            type="email"
                            value={settings.security.adminEmail || ''}
                            onChange={(e) => updateSetting('security', 'adminEmail', e.target.value)}
                            placeholder="admin@example.com"
                          />
                        </div>
                      </div>

                      {/* Password Change Form */}
                      <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                        <h4 className="text-sm font-medium text-theme-primary">Change Password</h4>
                        <div className="space-y-4">
                          <Input
                            label="Current Password"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            placeholder="Enter current password"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="New Password"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter new password"
                            />
                            <Input
                              label="Confirm New Password"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm new password"
                            />
                          </div>
                          <Button
                            onClick={changePassword}
                            loading={changingPassword}
                            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            variant="secondary"
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Two-Factor Authentication</h4>
                          <p className="text-sm text-theme-muted">Require 2FA for admin accounts</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Session Timeout (minutes)
                        </label>
                                                  <input
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                            className="w-full border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
                            min="5"
                            max="1440"
                          />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-theme-primary mb-4">Password Policy</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              Minimum Length
                            </label>
                            <input
                              type="number"
                              value={settings.security.passwordPolicy.minLength}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                minLength: parseInt(e.target.value)
                              })}
                              className="w-full border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
                              min="6"
                              max="50"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm ava-text-tertiary">Require Uppercase Letters</span>
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy.requireUppercase}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                requireUppercase: e.target.checked
                              })}
                              className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm ava-text-tertiary">Require Numbers</span>
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy.requireNumbers}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                requireNumbers: e.target.checked
                              })}
                              className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm ava-text-tertiary">Require Symbols</span>
                            <input
                              type="checkbox"
                              checked={settings.security.passwordPolicy.requireSymbols}
                              onChange={(e) => updateSetting('security', 'passwordPolicy', {
                                ...settings.security.passwordPolicy,
                                requireSymbols: e.target.checked
                              })}
                              className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-theme-primary">Payment Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Stripe Payments</h4>
                          <p className="text-sm text-theme-muted">Enable Stripe payment processing</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.payment.stripeEnabled}
                          onChange={(e) => updateSetting('payment', 'stripeEnabled', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      {settings.payment.stripeEnabled && (
                        <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                          <h5 className="text-sm font-medium text-theme-primary">Stripe Configuration</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <Input
                                label="Stripe Publishable Key"
                                type={showStripeKeys.publishable ? "text" : "password"}
                                value={settings.payment.stripePublishableKey || ''}
                                onChange={(e) => updateSetting('payment', 'stripePublishableKey', e.target.value)}
                                placeholder="pk_test_..."
                              />
                              <button
                                type="button"
                                onClick={() => setShowStripeKeys(prev => ({ ...prev, publishable: !prev.publishable }))}
                                className="absolute right-3 top-8 text-theme-muted hover:text-theme-primary focus:outline-none"
                              >
                                {showStripeKeys.publishable ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="relative">
                              <Input
                                label="Stripe Secret Key"
                                type={showStripeKeys.secret ? "text" : "password"}
                                value={settings.payment.stripeSecretKey || ''}
                                onChange={(e) => updateSetting('payment', 'stripeSecretKey', e.target.value)}
                                placeholder="sk_test_..."
                              />
                              <button
                                type="button"
                                onClick={() => setShowStripeKeys(prev => ({ ...prev, secret: !prev.secret }))}
                                className="absolute right-3 top-8 text-theme-muted hover:text-theme-primary focus:outline-none"
                              >
                                {showStripeKeys.secret ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-theme-muted">
                            Enter your Stripe API keys here. You can find these in your Stripe Dashboard under Developers &gt; API keys. 
                            For security, these values are stored securely and masked in the interface.
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">PayPal Payments</h4>
                          <p className="text-sm text-theme-muted">
                            {settings.payment.paypalEnabled 
                              ? "PayPal is enabled" 
                              : "PayPal is disabled by default (requires PAYPAL_CLIENT_ID and PAYPAL_SECRET environment variables)"
                            }
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.payment.paypalEnabled}
                          onChange={(e) => updateSetting('payment', 'paypalEnabled', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      {settings.payment.paypalEnabled && (
                        <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                          <h5 className="text-sm font-medium text-theme-primary">PayPal Configuration</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="PayPal Client ID"
                              type="password"
                              value={settings.payment.paypalClientId || ''}
                              onChange={(e) => updateSetting('payment', 'paypalClientId', e.target.value)}
                              placeholder="Client ID from PayPal Developer Dashboard"
                            />
                            <Input
                              label="PayPal Secret"
                              type="password"
                              value={settings.payment.paypalSecret || ''}
                              onChange={(e) => updateSetting('payment', 'paypalSecret', e.target.value)}
                              placeholder="Secret from PayPal Developer Dashboard"
                            />
                          </div>
                          <p className="text-xs text-theme-muted">
                            Your PayPal credentials can be found in your PayPal Developer Dashboard under Apps &gt; My Apps.
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-theme-primary">Apple Pay</h4>
                          <p className="text-sm text-theme-muted">
                            {settings.payment.applePayEnabled 
                              ? "Apple Pay is enabled" 
                              : "Apple Pay is disabled by default (requires APPLE_PAY_MERCHANT_ID environment variable)"
                            }
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.payment.applePayEnabled}
                          onChange={(e) => updateSetting('payment', 'applePayEnabled', e.target.checked)}
                          className="h-4 w-4 text-ava-accent focus:ring-ava-accent border-theme rounded"
                        />
                      </div>
                      {settings.payment.applePayEnabled && (
                        <div className="space-y-4 p-4 bg-theme-secondary rounded-lg border border-theme">
                          <h5 className="text-sm font-medium text-theme-primary">Apple Pay Configuration</h5>
                          <div className="grid grid-cols-1 gap-4">
                            <Input
                              label="Apple Pay Merchant ID"
                              type="password"
                              value={settings.payment.applePayMerchantId || ''}
                              onChange={(e) => updateSetting('payment', 'applePayMerchantId', e.target.value)}
                              placeholder="merchant.com.yourcompany.applepay"
                            />
                          </div>
                          <p className="text-xs text-theme-muted">
                            Your Apple Pay Merchant ID can be found in your Apple Developer account under Certificates, Identifiers &amp; Profiles &gt; Identifiers.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Currency
                          </label>
                          <select
                            value={settings.payment.currency}
                            onChange={(e) => updateSetting('payment', 'currency', e.target.value)}
                            className="w-full border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD (C$)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Tax Rate (%)
                          </label>
                          <input
                            type="number"
                            value={settings.payment.taxRate}
                            onChange={(e) => updateSetting('payment', 'taxRate', parseFloat(e.target.value))}
                            className="w-full border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
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
                    <h3 className="text-lg font-medium text-theme-primary">Shipping Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium ava-text-tertiary mb-2">
                          Free Shipping Threshold ($)
                        </label>
                        <input
                          type="number"
                          value={settings.shipping.freeShippingThreshold}
                          onChange={(e) => updateSetting('shipping', 'freeShippingThreshold', parseFloat(e.target.value))}
                          className="w-full border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium ava-text-tertiary mb-2">
                          Default Shipping Cost ($)
                        </label>
                        <input
                          type="number"
                          value={settings.shipping.defaultShippingCost}
                          onChange={(e) => updateSetting('shipping', 'defaultShippingCost', parseFloat(e.target.value))}
                          className="w-full border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-theme-primary mb-4">Shipping Zones</h4>
                      <div className="space-y-4">
                        {settings.shipping.shippingZones.map((zone, index) => (
                          <div key={index} className="border border-theme rounded-md p-4">
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
                                className="border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
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
                                className="border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
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
                                className="border border-theme rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-tertiary text-theme-primary"
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
                
                {/* Save Settings Button */}
                <div className="flex justify-end pt-6 border-t border-theme">
                  <Button
                    onClick={saveSettings}
                    disabled={saving}
                    className="px-6 py-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-theme-secondary rounded-lg shadow p-8 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-primary mb-2">No Settings Data</h3>
              <p className="text-theme-muted">Settings data will appear here once available.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminSettings 