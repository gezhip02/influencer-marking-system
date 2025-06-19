'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
              {step.id < currentStep ? (
                <div className="group">
                  <span className="flex items-start">
                    <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <CheckIcon className="h-6 w-6 text-white" />
                      </div>
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col">
                      <span className="text-sm font-semibold text-green-600">{step.name}</span>
                      <span className="text-sm text-green-500">{step.description}</span>
                    </span>
                  </span>
                </div>
              ) : step.id === currentStep ? (
                <div className="group">
                  <span className="flex items-start" aria-current="step">
                    <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                      <div className="h-10 w-10 rounded-full border-2 border-blue-600 bg-white flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{step.id}</span>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse"></div>
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col">
                      <span className="text-sm font-semibold text-blue-600">{step.name}</span>
                      <span className="text-sm text-blue-500">{step.description}</span>
                    </span>
                  </span>
                </div>
              ) : (
                <div className="group">
                  <span className="flex items-start">
                    <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
                      <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                        <span className="text-gray-500 font-medium text-sm">{step.id}</span>
                      </div>
                    </span>
                    <span className="ml-4 min-w-0 flex flex-col">
                      <span className="text-sm font-medium text-gray-500">{step.name}</span>
                      <span className="text-sm text-gray-400">{step.description}</span>
                    </span>
                  </span>
                </div>
              )}

              {stepIdx !== steps.length - 1 && (
                <div className="absolute top-5 left-10 -ml-px mt-0.5 h-0.5 w-full bg-gray-300">
                  <div 
                    className={`h-full transition-all duration-500 ease-in-out ${
                      step.id < currentStep 
                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                        : 'bg-gray-300'
                    }`}
                    style={{
                      width: step.id < currentStep ? '100%' : '0%'
                    }}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
} 