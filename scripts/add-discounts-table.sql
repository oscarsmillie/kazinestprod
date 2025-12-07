-- Create discounts table
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  min_amount DECIMAL(10, 2),
  max_amount DECIMAL(10, 2),
  applicable_plans VARCHAR[] DEFAULT ARRAY['professional'],
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_discount_usage table to track which users have used which discounts
CREATE TABLE IF NOT EXISTS public.user_discount_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, discount_id)
);

-- Create trial_subscriptions table for trial management
CREATE TABLE IF NOT EXISTS public.trial_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'converted', 'expired', 'cancelled')) DEFAULT 'active',
  stripe_trial_ends_at TIMESTAMPTZ,
  paystack_trial_reference VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trial_conversion_logs for tracking trial conversions
CREATE TABLE IF NOT EXISTS public.trial_conversion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_id UUID NOT NULL REFERENCES public.trial_subscriptions(id) ON DELETE CASCADE,
  action VARCHAR(50) CHECK (action IN ('converted', 'expired', 'cancelled', 'reminder_sent')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON public.discounts(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_discount_usage_user_id ON public.user_discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_user_id ON public.trial_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_subscriptions_status ON public.trial_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_trial_conversion_logs_user_id ON public.trial_conversion_logs(user_id);
