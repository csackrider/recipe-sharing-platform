-- ============================================================
-- 1. Add image_url column to recipes
-- ============================================================
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- 2. Likes table
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id   UUID        NOT NULL REFERENCES recipes(id)    ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON likes FOR SELECT USING (true);

CREATE POLICY "Users can like recipes"
  ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike recipes"
  ON likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. Saved recipes table
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_recipes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id   UUID        NOT NULL REFERENCES recipes(id)    ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved recipes"
  ON saved_recipes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave recipes"
  ON saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. Storage bucket + policies for recipe-images
--    Run this block only if you haven't created the bucket yet.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read for recipe images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can upload recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their recipe images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'recipe-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
