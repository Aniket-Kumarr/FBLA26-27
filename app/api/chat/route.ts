import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseClient } from '@/lib/supabase-client';

// Free tier: get key from https://aistudio.google.com/apikey (no credit card). Use GEMINI_API_KEY or GOOGLE_API_KEY.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('Gemini API key missing: set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env.local');
}

// Full club/class descriptions for Gemini (user requested full text in prompt)
const CLUBS_KNOWLEDGE = `
CLASSES
- Python Programming I Honors: Learn Python programming from the ground up with hands-on projects and real-world applications. Topics include variables, data structures, functions, object-oriented programming, and file handling. Perfect for beginners looking to build a strong programming foundation.
- AP Calculus BC: Advanced calculus course covering differential and integral calculus, sequences, series, and parametric equations. This rigorous course prepares students for the AP Calculus BC exam and provides a strong foundation for college-level mathematics and engineering courses.
- AP Computer Science Principles: Explore the fundamentals of computer science including programming, data analysis, algorithms, and the impact of computing on society. This course prepares students for the AP Computer Science Principles exam and introduces computational thinking skills.

STEM
- Every Student Succeeds at Math (ESSAM): ESSAM is a nonprofit organization committed to providing free math support to elementary school students. It was founded out of a deep passion for mathematics and a recognition of the critical need for foundational support, particularly at the elementary level in Title I schools. By reaching students at a young age, ESSAM helps them build strong math skills, grow their confidence, and set the stage for long-term academic success.
- Excel Academy: Excel Academy is a fully volunteer-run nonprofit organization dedicated to supporting the education and success of underprivileged students. To strengthen our community and those around us, we implement STEM programs in low-income schools and provide free tutoring and academic support to students across the nation.
- W.I.S.H: We aim to equip youth with the digital and AI skills they need to thrive in the future by making tech education accessible, engaging, and empowering for all.
- STEMReach: STEMReach is a student-led tutoring service that connects motivated students with peers to help them succeed in STEM subjects through personalized, approachable support. Led entirely by students, it focuses on building confidence, strengthening problem-solving skills, and making challenging concepts easier to understand.
- MindSetMath: Mindset Math teaches kids about Math; its skills vary from computer science to internships to leadership positions. Join as a member today!
- NCSteminate Chapter: The local North Carolina chapter of Steminate engages students in STEM activities, organizes events, and partners with outreach centers. Join us to develop your skills, make an impact, and take on leadership positions.
- Mindsnet: Study Smarter. Efficient Learning Tips. Turning overwhelm into productivity. Blog launch coming soon. Save this page for study hacks, motivation and science-backed techniques.
- CAIVO (Charlotte AI Vanguard Organization): CAIVO is a student-led initiative dedicated to exploring the world of AI through debate, discussion, and virtual learning. We host engaging AI lessons, coding workshops, and virtual events focused on AI ethics, innovation, and real-world applications in finance, STEM, and the job market. At CAIVO, we emphasize using AI responsibly while considering its long-term impact on society, and we continue to research and share projects that benefit our community in the Charlotte region.

HEALTH & WELLNESS
- NC Teen Mental Health Association: We are a student-run initiative group dedicated to spreading awareness about teen mental health and raising money through fundraisers and speeches to support mental health charities.
- UpLife.CLT: We are a nonprofit organization committed to helping homeless individuals and supporting shelters to transform lives. Our mission is to enable shelters to accommodate more people and provide essential resources for those in need.
- Alturos: Promote Mental Health and mental wellbeing; solving and raising awareness about stress and such issues.
- another chance CLT: Another chance CLT will soon be partnering with Uplife.CLT in an unexpected collaboration.
- BrightCareKids: BrightCareKids is a student-led organization where we help kids with disabilities to thrive and reach their full potential. We aim to provide children with disabilities the tools, experience, and confidence they need to succeed; while raising awareness and building a world where all abilities are valued. We host events, fundraisers, and activities to raise money and awareness for pediatric therapies, YMCAs, and disability centers. Be an officer today and make a meaningful difference.
- Bloom and Soar: At Bloom and Soar, we believe that every person deserves to flourish, and no one should face their mental health journey alone. Founded by students who understand the unique challenges of our generation, we're more than an organization, we're a movement dedicated to transforming how young people approach mental wellness. Our mission extends beyond awareness into action: we're building a comprehensive digital sanctuary where you can express yourself anonymously, discover vital resources, and connect with others who truly understand. Together, we bloom where we're planted and soar toward a brighter tomorrow.

COMMUNITY & SERVICE
- Snack Packs for Hope: We are Snack Packs for Hope, a nonprofit based in Ballantyne where we help people who are homeless by giving them food or Snack Packs.
- Indian American Youth Leadership (IAYL): IAYL empowers Indian American youth through service and advocacy, offering leadership roles and internship opportunities.
- TheBinBros: A dynamic cleaning and lawn care duo specializing in trash can deep-cleans, pressure washing, and precision mowing. Built on friendship and hustle, they transform grimy spaces into spotless, polished areas with eco-friendly solutions. Whether it's a single service or a recurring glow-up for your property, these buds deliver reliability and satisfaction—no mess too small!
- NCSAAP (North Carolina South Asian Solidarity Project): North Carolina South Asian Solidarity Project is an organization with a mission to foster community through historical research and exploration of the diasporic experiences of South Asian immigrants and their integration into America. By uncovering and sharing these stories, the organization aims to build connections, promote understanding, and celebrate the contributions of the South Asian community.
- Epidra Project: EPIDRA is a community that believes every skin tells a story. We aim to raise awareness about the importance of skincare, sun protection, and understanding skin conditions that are often overlooked or misunderstood.
- ProjectUcoderNC: A coding community for students to learn Python, Java, and more.
- ACS: We are the CLT community chapter of the American Cancer Society. We host events to raise money for cancer research and provide support for those affected by cancer. We plan to have exciting events for the city of CLT and support our local community.
- HelpingHands mrhs: Helping Hands is a student-led organization that operates through high school clubs in order to connect students with volunteer opportunities. Each school chapter is led by students who plan and run service projects, donation drives, and volunteer events. Chapters are connected through Helping Hands HQ, which provides resources, ideas, and support, but each chapter decides what causes to focus on based on the needs of their community.
- Stride Forward Foundation: We are an organization founded by Weddington High School students that organizes local running races in the Charlotte area to raise funds for various charitable causes. This summer, we donated over 6 thousand dollars for Hurricane Helene recovery for Buncombe County Schools.
- Homeless Hearth: We are a student-led organization dedicated to addressing homelessness across the United States and providing meaningful support to underserved populations. Based in the Charlotte area, we strive to offer a variety of resources and assistance to help improve the lives of individuals experiencing homelessness within our community.
- Jamba Jamba: A nonprofit that helps people find themselves within the community.
- T1D United: T1D United was founded by Krisha Karamchandani and Krivisha Nuthakki with the mission to raise awareness and funds for Type 1 Diabetes. Through community events, fundraisers, and educational outreach, we aim to spread knowledge, support ongoing research, and empower those affected by Type 1 Diabetes. Our vision is a future where no one faces Type 1 Diabetes alone—and where a cure is within reach.
- Ivan Cheah Cutz For Kidz: Ivan Cheah, yes THE Ivan Cheah, talented barber is offering free service cuts to kids in the youth community! If you have a younger sibling or friend, go contact him and get that fresh cut!
- Queen City Blendz: Adi and Rithvik, two friends, started a hair-cutting business providing top-notch haircuts to clients across the city. Their entrepreneurial venture combines skill, creativity, and a passion for serving the community.
- teenvolunteernetwork_clt: We are a Charlotte-based organization designed to get local teens more involved in their community through volunteering. We ourselves struggled in the past to find volunteer opportunities accessible to teens. We wished that there was a place that had all the needed information, so we made one ourselves. Our goal is to encourage teens, like us, to get out and help their community more.
- North Carolina Asian Americans Together (NCAAT): NCAAT is an Asian American organization dedicated to addressing the challenges faced by our community through advocacy and education. They offer ambassador programs and internships that provide valuable leadership experience and stipends to support young Asian Americans. Join NCAAT to empower yourself, build skills, and make a meaningful impact.

OTHER
- Seek: A clothing brand that sells clothing items and more, custom made by Atharv.
- Vales and Co: A company that teaches you strategy and marketing all in one. Learn the skills you need to grow and succeed—join today!
- ProjectScrubEra: Best friends Jia and Chahat hand-crafted hundreds of bracelets and delivered them to multiple clinics and hospitals across North and South Carolina. Each bracelet featured positive phrases designed to encourage and uplift healthcare staff during challenging days, spreading small but meaningful reminders of appreciation and support.
- FBTF nonprofit (Fire & Burn Trauma): Fire & Burn Trauma is a nonprofit organization dedicated to supporting individuals affected by fires and burn-related tragedies, providing comfort, resources, and assistance during difficult times.
- Aspira: Aspira is an entrepreneurship and business club that promotes leadership positions across multiple fields, including Finance, Business, and more. Join today! Check out our website aspiraa.netlify.app
- The Business Ledger: Business Ledger is a blog that showcases both new and established business owners from multiple industries. Our goal is to inspire and inform future entrepreneurs through honest, in-depth interviews that explore how each business began, the challenges they faced, and how they pushed through. We focus on real experiences, financial struggles, tough markets, personal setbacks, and how business owners adapt in today's fast-changing world. By sharing these stories, we offer readers practical advice, meaningful lessons, and motivation to pursue their own paths. Every business has a story worth telling, and Business Ledger is here to share them with purpose and impact.
- JJs junk drawer: JJ runs a student-led business creating and selling unique handmade cups, shirts, and other custom designs.
- Charlotte Youth Marketing Association (CYMA): CYMA is a student-led organization that hosts business-related events, promotes marketing skills, and offers multiple leadership positions for members to grow and lead.
- ESL teen tutors: Free Multilingual Tutoring – Connect your child with qualified tutors who speak your language and understand your cultural background. Services are free and available in over 25 languages. Visit our website: www.eslteentutors.org
- Beyond the White Coat: Our mission is to uncover the stories, passions, and lives beyond their white coat. We believe that every white coat has a story—and we are here to bring it to life.
- Nightingale AK Chapter: Ardrey Kell's very own chapter of Nightingale; join now and become a lead officer.
- Project Infinite Horizons (PIH): Project Infinite Horizons (PIH) is a student-led nonprofit organization dedicated to raising awareness for neurological conditions faced by kids. We also host various fundraising events to raise money to donate directly to hospitalized kids.
- Finance Club Ardrey Kell: A club that promotes financial literacy and digital literacy, is involved in the stock market movement, and offers multiple volunteering opportunities. Join today!
- Thrive2gethr: A student-led nonprofit fighting food insecurity by partnering with your favorite restaurants.
- Echelon: We are a student-led nonprofit promoting cybersecurity awareness. We host workshops, share resources, and are building a website with a course for kids to learn digital safety.
- within_yourglow: Empowering skin confidence, offering skincare tips, and much more relatable content!
- QueenCity Resells: A local Charlotte business specializing in reselling items like headphones, AirPods, iPhones, colognes, and more—with even more great finds coming soon! His prices are some of the best in town, so be sure to check him out at @QueenCityResells.
- Harshi Nailss: Harshi nails is a local business that sells custom press-on nails. Orders are only available through IG, so DM us @Harshi_nailss.
- FeedCLT: An organization that provides homeless shelters with different resources to help them. We also interview homeless people.
- Sebas Depop: A young entrepreneur selling handmade clothes and shoes—offering everything from unique fashion pieces to quick, budget-friendly finds. He has many valuable items, so support this student business and shop today!
- AK NEX: AK NEX showcases the psychology program at Ardrey Kell High School and is open to all students. Explore the world of psychology, get involved, and gain valuable leadership opportunities.
- lyfr: A student hub built by Shivang Patel for students to use at school! Sets up success for second semester, has multiple functions that can be used. Visit lyfr.vercel.app
- MedSearch Charlotte: Official MedSearch Chapter of Charlotte Mecklenburg. Student-Led. Future Healthcare Leaders. Innovation in Research. Chapters Worldwide.
- AK USAAIO Chapter: Ardrey Kell's very own Artificial Intelligence Olympiad chapter; get a chance to go to MIT and much more opportunities.
- HeartsinBloomOrg: Based in NC. Healthcare focused. Recognition opportunities for teens. Initiatives with IMPACT. More info coming soon!
`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured', details: 'Set GEMINI_API_KEY or GOOGLE_API_KEY in .env.local (from aistudio.google.com/apikey)' },
        { status: 500 }
      );
    }

    // Fetch clubs for context (don't let this break the request)
    let ragContext = '';
    try {
      const { data: clubs, error: clubsError } = await supabaseClient
        .from('lisitngs')
        .select('title, description, location, meeting_time, members, category')
        .limit(100);
      if (!clubsError && clubs?.length) {
        ragContext = 'Additional listings:\n';
        clubs.slice(0, 30).forEach((club: any, index: number) => {
          ragContext += `${index + 1}. ${club.title || 'Unnamed'}: ${(club.description || '').slice(0, 120)}${(club.category && ` [${club.category}]`) || ''}\n`;
        });
      }
    } catch (e) {
      console.error('Clubs fetch failed (continuing without):', e);
    }

    // Use Gemini 2.5 Flash (free tier in Google AI Studio; same key works)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build system prompt with static clubs knowledge + any dynamic RAG from Supabase
    const systemPrompt = `You are Community Hub, a helpful assistant for the CLT CommunityHub platform. Your role is to answer questions about clubs, organizations, classes, and community activities in Charlotte, NC.

RULES:
1. Only answer questions about clubs, organizations, classes, or community activities. Otherwise politely redirect.
2. Use the knowledge base below to answer. Write in full sentences, in a friendly descriptive way like the descriptions given—do not say "I don't have further details" or "I don't have specific details" when the knowledge base has information about that club. Use what you know and describe the club in a short paragraph.
3. Keep answers to a few sentences. Flow naturally; no bullet points unless the user asks for a list.
4. If a club truly is not in the knowledge base, say so briefly and suggest they check the full listings.

--- KNOWLEDGE BASE ---
${CLUBS_KNOWLEDGE}
${ragContext ? `\n${ragContext}` : ''}
--- END ---

Answer the user in full sentences using the knowledge above. Do not chunk or abbreviate; write like the descriptions in the knowledge base.`;

    // Build conversation history for context
    let conversationText = '';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: { sender: string; text: string }) => {
        if (msg.sender === 'user') {
          conversationText += `User: ${msg.text}\n`;
        } else {
          conversationText += `Assistant: ${msg.text}\n`;
        }
      });
    }

    // Combine system prompt with conversation history and current message
    const fullPrompt = `${systemPrompt}\n\n${conversationText ? `Previous conversation:\n${conversationText}\n\n` : ''}User: ${message}\nAssistant:`;

    // Generate response with Gemini 2.5 Flash
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    let text = '';
    try {
      text = response?.text?.() ?? '';
    } catch (textError: any) {
      console.error('response.text() failed:', textError);
      return NextResponse.json(
        { error: 'Response was blocked or empty. Please try again.', details: textError?.message },
        { status: 500 }
      );
    }
    if (!text.trim()) {
      return NextResponse.json(
        { error: 'No response from the model. Please try again.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    const message = error?.message ?? String(error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: message,
      },
      { status: 500 }
    );
  }
}

