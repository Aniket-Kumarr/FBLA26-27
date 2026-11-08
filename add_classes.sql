-- Add Computer Science and Math Classes to lisitngs table
-- Note: Category is computed automatically by the dashboard based on title/description keywords
-- The getCategory function will detect "AP", "class", "course", "programming", "calculus" keywords and assign "Classes" category

INSERT INTO lisitngs (title, description, latitude, longitude)
VALUES
    (
        'AP Computer Science Principles',
        'Explore the fundamentals of computer science including programming, data analysis, algorithms, and the impact of computing on society. This course prepares students for the AP Computer Science Principles exam and introduces computational thinking skills.',
        35.2271 + (RANDOM() * 0.1 - 0.05),
        -80.8431 + (RANDOM() * 0.1 - 0.05)
    ),
    (
        'Python Programming I Honors',
        'Learn Python programming from the ground up with hands-on projects and real-world applications. Topics include variables, data structures, functions, object-oriented programming, and file handling. Perfect for beginners looking to build a strong programming foundation.',
        35.2271 + (RANDOM() * 0.1 - 0.05),
        -80.8431 + (RANDOM() * 0.1 - 0.05)
    ),
    (
        'AP Calculus BC',
        'Advanced calculus course covering differential and integral calculus, sequences, series, and parametric equations. This rigorous course prepares students for the AP Calculus BC exam and provides a strong foundation for college-level mathematics and engineering courses.',
        35.2271 + (RANDOM() * 0.1 - 0.05),
        -80.8431 + (RANDOM() * 0.1 - 0.05)
    );

-- Verify the inserted records
SELECT id, title, description, latitude, longitude
FROM lisitngs
WHERE title IN ('AP Computer Science Principles', 'Python Programming I Honors', 'AP Calculus BC');

