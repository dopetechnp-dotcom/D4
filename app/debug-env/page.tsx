'use client'

import { useEffect, useState } from 'react'

export default function DebugEnvPage() {
  const [envInfo, setEnvInfo] = useState<any>(null)

  useEffect(() => {
    setEnvInfo({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendKey: !!process.env.RESEND_API_KEY,
      adminEmail: process.env.ADMIN_EMAIL,
      timestamp: new Date().toISOString(),
      deploymentId: 'FORCE_NEW_DEPLOYMENT_' + Date.now()
    })
  }, [])

  if (!envInfo) {
    return <div className="p-8">Loading environment info...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment Debug Info</h1>
      
      <div className="bg-red-900 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-red-200 mb-2">⚠️ IMPORTANT</h2>
        <p className="text-red-100">
          If this shows the OLD database URL, Vercel is using cached environment variables.
          You need to clear the build cache and redeploy.
        </p>
      </div>
      
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Supabase Configuration</h2>
        
        <div className="space-y-3">
          <div>
            <strong>Supabase URL:</strong>
            <div className="text-sm text-gray-300 break-all mt-1">
              {envInfo.supabaseUrl || 'Not set'}
            </div>
            {envInfo.supabaseUrl && envInfo.supabaseUrl.includes('aizgswoelfdkhyosgvzu') && (
              <div className="text-red-400 text-sm mt-1">❌ OLD DATABASE - Update Vercel env vars!</div>
            )}
            {envInfo.supabaseUrl && envInfo.supabaseUrl.includes('flrcwmmdveylmcbjuwfc') && (
              <div className="text-green-400 text-sm mt-1">✅ NEW DATABASE - Working correctly!</div>
            )}
          </div>
          
          <div>
            <strong>Anon Key:</strong>
            <div className="text-sm text-gray-300">
              {envInfo.hasAnonKey ? '✅ Set' : '❌ Not set'}
            </div>
          </div>
          
          <div>
            <strong>Service Role Key:</strong>
            <div className="text-sm text-gray-300">
              {envInfo.hasServiceKey ? '✅ Set' : '❌ Not set'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
        
        <div className="space-y-3">
          <div>
            <strong>Resend API Key:</strong>
            <div className="text-sm text-gray-300">
              {envInfo.resendKey ? '✅ Set' : '❌ Not set'}
            </div>
          </div>
          
          <div>
            <strong>Admin Email:</strong>
            <div className="text-sm text-gray-300">
              {envInfo.adminEmail || 'Not set'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg mt-6">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        
        <div className="space-y-3">
          <div>
            <strong>Timestamp:</strong>
            <div className="text-sm text-gray-300">
              {envInfo.timestamp}
            </div>
          </div>
          
          <div>
            <strong>Deployment ID:</strong>
            <div className="text-sm text-gray-300">
              {envInfo.deploymentId}
            </div>
          </div>
          
          <div>
            <strong>Environment:</strong>
            <div className="text-sm text-gray-300">
              {process.env.NODE_ENV}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
        <h3 className="font-semibold text-yellow-300 mb-2">Expected Database:</h3>
        <div className="text-sm text-yellow-200">
          Should be: <code>https://flrcwmmdveylmcbjuwfc.supabase.co</code>
        </div>
        <div className="text-sm text-yellow-200 mt-1">
          If different, clear Vercel build cache and redeploy!
        </div>
      </div>
    </div>
  )
}
