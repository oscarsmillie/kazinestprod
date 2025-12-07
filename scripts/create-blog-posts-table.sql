-- Create blog_posts table for public blog content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_name TEXT NOT NULL DEFAULT 'KaziNest Team',
  author_avatar TEXT,
  category TEXT NOT NULL DEFAULT 'Career Tips',
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts(is_featured, published_at DESC);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view published posts
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

-- Only admins can manage blog posts (using service role key)
DROP POLICY IF EXISTS "Service role can manage blog posts" ON public.blog_posts;
CREATE POLICY "Service role can manage blog posts" ON public.blog_posts
  FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_posts_updated_at();

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, author_name, category, is_published, published_at) VALUES
(
  '10 Tips to Ace Your Next Job Interview in Africa',
  '10-tips-ace-job-interview-africa',
  'Discover the essential strategies that will help you stand out in competitive job interviews across African markets.',
  '<p>Job interviews can be nerve-wracking, but with the right preparation, you can turn them into opportunities to showcase your skills and land your dream job.</p><h2>1. Research the Company</h2><p>Before any interview, thoroughly research the company''s mission, values, recent news, and industry position. This shows genuine interest and helps you tailor your responses.</p><h2>2. Understand the Local Market</h2><p>African job markets have unique characteristics. Understanding local business culture, salary expectations, and industry trends will give you an edge.</p><h2>3. Prepare Your STAR Stories</h2><p>Use the Situation, Task, Action, Result format to structure your answers to behavioral questions. Have at least 5 prepared examples ready.</p><h2>4. Dress Appropriately</h2><p>First impressions matter. Research the company culture and dress slightly more formal than the everyday office attire.</p><h2>5. Practice Common Questions</h2><p>Rehearse answers to common interview questions, but avoid sounding robotic. Use KaziNest''s AI Interview Prep tool for realistic practice sessions.</p>',
  'Oscar Williams',
  'Career Tips',
  true,
  NOW() - INTERVAL '1 day'
),
(
  'How to Write a Resume That Gets You Hired',
  'write-resume-gets-hired',
  'Learn the art of crafting a compelling resume that catches recruiters'' attention and lands you interviews.',
  '<p>Your resume is often the first impression you make on a potential employer. In today''s competitive job market, a well-crafted resume can be the difference between landing an interview and being overlooked.</p><h2>Start with a Strong Summary</h2><p>Your professional summary should be a compelling snapshot of your career highlights and what you bring to the table.</p><h2>Use Action Verbs</h2><p>Begin bullet points with strong action verbs like "achieved," "implemented," "led," and "developed" to demonstrate your impact.</p><h2>Quantify Your Achievements</h2><p>Numbers speak louder than words. Instead of "improved sales," write "increased sales by 35% within 6 months."</p><h2>Tailor for Each Application</h2><p>Customize your resume for each job application by incorporating keywords from the job description.</p>',
  'Sarah Johnson',
  'Resume Writing',
  true,
  NOW() - INTERVAL '3 days'
),
(
  'Remote Work Opportunities for African Professionals',
  'remote-work-african-professionals',
  'Explore the growing landscape of remote work opportunities and how African professionals can tap into the global market.',
  '<p>The remote work revolution has opened unprecedented opportunities for African professionals to work with companies worldwide without leaving their home countries.</p><h2>The Rise of Remote Work in Africa</h2><p>With improved internet infrastructure and a growing tech-savvy workforce, Africa is becoming a hub for remote talent.</p><h2>Top Industries for Remote Work</h2><p>Software development, digital marketing, customer support, content writing, and design are among the most in-demand remote roles for African professionals.</p><h2>Building Your Remote Career</h2><p>Success in remote work requires self-discipline, excellent communication skills, and the ability to manage your time effectively across different time zones.</p>',
  'David Okonkwo',
  'Remote Work',
  true,
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (slug) DO NOTHING;

RAISE NOTICE '✅ Blog posts table created and sample data inserted';
