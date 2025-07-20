'use client'

import React, { useState, useEffect } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function TestThemePage() {
  const [cssVars, setCssVars] = useState<Record<string, string>>({})

  useEffect(() => {
    const updateCssVars = () => {
      const root = document.documentElement
      const vars = {
        '--ava-bg-primary': getComputedStyle(root).getPropertyValue('--ava-bg-primary'),
        '--ava-text-primary': getComputedStyle(root).getPropertyValue('--ava-text-primary'),
        '--ava-primary': getComputedStyle(root).getPropertyValue('--ava-primary'),
        '--ava-cream': getComputedStyle(root).getPropertyValue('--ava-cream'),
      }
      setCssVars(vars)
    }

    updateCssVars()
    
    // Update when theme changes
    const observer = new MutationObserver(updateCssVars)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Theme Toggle Test</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Theme State</h2>
          <div className="bg-theme-secondary p-4 rounded-lg">
            <p><strong>HTML class:</strong> {document.documentElement.className}</p>
            <p><strong>Has 'dark' class:</strong> {document.documentElement.classList.contains('dark') ? 'Yes' : 'No'}</p>
            <p><strong>LocalStorage theme:</strong> {typeof window !== 'undefined' ? localStorage.getItem('theme') || 'none' : 'N/A'}</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">CSS Variables</h2>
          <div className="bg-theme-secondary p-4 rounded-lg space-y-2">
            {Object.entries(cssVars).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <code className="text-sm">{key}:</code>
                <code className="text-sm">{value}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Theme Toggle</h2>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span>Click the button above to toggle between light and dark themes</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Visual Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-theme-primary border border-theme p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Primary Background</h3>
              <p className="text-theme-secondary">This should change color when you toggle the theme.</p>
            </div>
            <div className="bg-theme-secondary border border-theme p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Secondary Background</h3>
              <p className="text-theme-secondary">This should also change color when you toggle the theme.</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Color Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--ava-primary)] text-[var(--ava-cream)] p-4 rounded-lg text-center">
              Primary
            </div>
            <div className="bg-[var(--ava-secondary)] text-[var(--ava-cream)] p-4 rounded-lg text-center">
              Secondary
            </div>
            <div className="bg-[var(--ava-accent)] text-theme-primary p-4 rounded-lg text-center">
              Accent
            </div>
            <div className="bg-[var(--ava-gold)] text-theme-primary p-4 rounded-lg text-center">
              Gold
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 