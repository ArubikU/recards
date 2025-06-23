"use client"

import { getTierObject } from "@/lib/getLimits"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"
import { billingLabels, CURRENCY, CURRENCY_SYMBOLS, plans, WAYS_KEYS } from "./billingLabels"
import CheckoutButton from "./checkout-button"

export default function PricingTable() {
  const { isSignedIn, user } = useUser()
  const [billingPeriod, setBillingPeriod] = useState<WAYS_KEYS>("monthly")
  const [currency, setCurrency] = useState<CURRENCY>("USD")
  const currentPlan = getTierObject(user?.publicMetadata?.plan as string | undefined || "free")

  const indexOfPlan = plans.findIndex((plan) => plan.id === currentPlan.id)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div className="bg-ivory rounded-full p-1 inline-flex shadow-lg">
          {Object.keys(billingLabels).map((period) => (
            <button
              key={period}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                billingPeriod === period
                  ? "bg-iris text-white"
                  : "text-ink hover:bg-gray-200"
              }`}
              onClick={() => setBillingPeriod(period as any)}
            >
              {billingLabels[period]}
            </button>
          ))}
        </div>
        <div className="ml-4 bg-ivory rounded-full p-1 inline-flex shadow-lg">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CURRENCY)}
            className="px-4 py-2 rounded-full text-sm font-medium"
          >
            {Object.keys(CURRENCY_SYMBOLS).map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="flex overflow-x-auto gap-6 snap-x snap-mandatory px-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible max-w-7xl mx-auto">
        {plans.map((plan, index) => {
          const price = plan.prices[currency as CURRENCY][billingPeriod]
          let isCurrent = currentPlan.id === plan.id
          if (plan.id === "ultimate" && currentPlan.id === "ultra") isCurrent = true

          const CardWrapper = motion.div
          return (
            <CardWrapper
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`snap-center min-w-[85%] md:min-w-0 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full transform transition hover:scale-105
                ${plan.recommended
                  ? "border-4 border-iris bg-gradient-to-b from-irisforeground to-white scale-105 lg:scale-110"
                  : "bg-ivory"}
              `}
            >
              {plan.recommended && (
                <div className="bg-iris text-white text-center py-2 text-sm font-semibold uppercase tracking-wide">
                  Recomendado
                </div>
              )}

              {!plan.recommended && (
                <div className={` text-center py-2 text-sm font-semibold uppercase tracking-wide
                
                ${index === plans.length - 1
          ? "bg-ivory-lavanda-stripes text-ivory"
                  : "bg-gray-100 text-ink"}
                `}>
                  {plan.id === "free" ? "Gratuito" : "Plan Ultimate"}
                </div>
              )}

              
              <div className={`p-6 border-b border-gray-200 text-center md:text-left space-y-3 
                `}>
                <h3 className={`text-2xl font-extrabold mb-2` + (isCurrent ? " text-iris" : "")}>
                  {plan.name}
                </h3>
                <p className="mb-4 min-h-[48px]">{plan.description}</p>
                <div className="flex items-end justify-center md:justify-start">
                  <span className="text-4xl font-bold">
                    {price === 0 ? `${CURRENCY_SYMBOLS[currency]} 0` : `${CURRENCY_SYMBOLS[currency]} ${price}`}
                  </span>
                  <span className="ml-1">/mes</span>
                </div>
                {billingPeriod === "yearly" && plan.prices[currency].yearly !== 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Facturado anualmente (${(plan.prices[currency].yearly * 12)}/año)
                  </p>
                )}
                {billingPeriod === "quarterly" && plan.prices[currency].quarterly !== 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Facturado Cuatrimestralmente (${(plan.prices[currency].quarterly * 4)}/cuatrimestre)
                  </p>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1 text-center md:text-left">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start justify-center md:justify-start ${plan.recommended ? `${idx%2 === 0 ? "bg-irisforeground/50" : "bg-irid=s-50/50"}` : ""} p-2 rounded-md`}>
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.unavailable.map((feature, idx) => (
                    <li key={`x-${idx}`} className="flex items-start justify-center md:justify-start text-gray-400  p-2 rounded-md">
                      <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {isSignedIn ? (
                    <CheckoutButton planId={plan.id} isCurrentPlan={isCurrent} billingPeriod={billingPeriod} disabled={index < indexOfPlan} />
                  ) : (
                    <Link
                      href="/register"
                      className="w-full py-2 px-4 bg-iris text-white font-semibold rounded-lg text-center block hover:bg-irisdark transition"
                    >
                      {price === 0 ? "Comenzar Gratis" : "Elegir Plan"}
                    </Link>
                  )}
                </div>
              </div>
            </CardWrapper>
          )
        })}
      </div>
    </div>
  )
}
