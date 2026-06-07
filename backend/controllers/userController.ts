import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserProfileModel from '../models/User.js';
import InternshipModel from '../models/Internship.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserProfileModel.find({});
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await UserProfileModel.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, companyName } = req.body;
    const updated = await UserProfileModel.findOneAndUpdate(
      { id }, 
      { role, companyName: role === 'Company' ? companyName : undefined }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password || 'Welcome@123', 10);
    const newUser = new UserProfileModel({
      ...req.body,
      password: hashedPassword
    });
    await newUser.save();
    
    const userObj = newUser.toObject() as any;
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await UserProfileModel.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAvatarImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    }

    const hasCloudinary = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudinary) {
      const publicUrl = `/uploads/${req.file.filename}`;
      return res.json({ 
        success: true, 
        url: publicUrl,
        provider: 'local'
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars',
      resource_type: 'image',
      transformation: [
        { width: 250, height: 250, crop: 'fill', gravity: 'face' }
      ],
      public_id: `avatar-${Date.now()}`
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.json({ 
      success: true, 
      url: result.secure_url,
      provider: 'cloudinary'
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ error: error.message });
  }
};

export const enhanceBio = async (req: Request, res: Response) => {
  try {
    const { bio } = req.body;
    if (!bio) {
      return res.status(400).json({ error: 'Bio content is required for enhancement.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      const words = bio.trim().split(/\s+/);
      let enhanced = bio;
      if (words.length > 5) {
        enhanced = `As a dedicated professional, I specialize in leveraging modern technologies to build scalable, high-performance solutions. Specifically, I am passionate about: ${bio.trim().replace(/^\w/, (c: string) => c.toLowerCase())} With a strong focus on collaboration and delivering premium quality, I continuously strive to grow my skillset and drive impactful results.`;
      } else {
        enhanced = `Driven and detail-oriented professional with a strong interest in technology and software development, seeking to leverage skills in building impactful solutions.`;
      }
      return res.json({
        success: true,
        enhancedBio: enhanced,
        simulated: true
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer and career coach. Your task is to enhance, polish, and professionally rewrite the user\'s brief professional biography/elevator pitch. Keep the response concise (2-4 sentences), highly professional, engaging, and in first-person format. Do not add any preamble, conversational filler, or introductory/concluding remarks. Return only the enhanced bio text.'
          },
          {
            role: 'user',
            content: bio
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const enhancedBio = data.choices?.[0]?.message?.content?.trim();
    
    if (!enhancedBio) {
      throw new Error('Received empty response from Groq API.');
    }

    return res.json({
      success: true,
      enhancedBio,
      simulated: false
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const auditMatch = async (req: Request, res: Response) => {
  try {
    const { userId, listingId } = req.body;
    if (!userId || !listingId) {
      return res.status(400).json({ error: 'User ID and Listing ID coordinates are required.' });
    }

    const student = await UserProfileModel.findOne({ id: userId });
    const listing = await InternshipModel.findOne({ id: listingId });

    if (!student) return res.status(404).json({ error: 'Student profile not found.' });
    if (!listing) return res.status(404).json({ error: 'Placement listing not found.' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Local matching logic
      const studentSkills = (student.skills || []).map(s => s.toLowerCase());
      const jobSkills = (listing.skills || []).map(s => s.toLowerCase());

      const matchedSkills = jobSkills.filter(s => studentSkills.some(ss => ss.includes(s) || s.includes(ss)));
      const missingSkills = jobSkills.filter(s => !matchedSkills.includes(s));

      const totalSkills = jobSkills.length || 1;
      const matchPercentage = Math.round((matchedSkills.length / totalSkills) * 100);

      const studentGrades = (student.toObject() as any).grades || [];
      const hasGrades = studentGrades.length > 0;
      const lastGrade = hasGrades ? studentGrades[studentGrades.length - 1] : null;

      const responseText = `### AI Audit Results for ${listing.title} at ${listing.company}

**Match Score:** ${matchPercentage}%

**Strong Points:**
- You have matched ${matchedSkills.length} key technical skills: ${matchedSkills.map(s => `\`${s}\``).join(', ') || 'None yet'}.
- Your biography indicates a strong foundation in university project credentials.
${hasGrades ? `- Your latest academic performance (Semester GPA: ${lastGrade.gpa}) meets university standards.` : '- Note: No semester grades are listed on your profile yet.'}

**Areas for Improvement & Recommended Updates:**
${missingSkills.length > 0 ? `- **Skills Gap:** Consider adding ${missingSkills.map(s => `\`${s}\``).join(', ')} to your credentials list.` : '- **Skills Match:** Excellent alignment with required technologies!'}
- **Biography Polish:** Your biography does not highlight specific experience with ${listing.category} systems. We suggest updating your bio to detail projects matching the job description: *"${listing.description.substring(0, 100)}..."*
- **Certificates:** Uploading certifications related to ${listing.category} would significantly boost your visibility.

**Recommended Biography Tailored to this Role:**
*"As an ambitious student at SPSU with expertise in ${matchedSkills.join(', ') || 'software systems'}, I am excited to apply for the ${listing.title} role. My academic background and project experience align with building scalable systems at ${listing.company}."*`;

      return res.json({
        success: true,
        auditText: responseText,
        matchScore: matchPercentage,
        simulated: true
      });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an elite AI career advisor and placement auditor at Sir Padampat Singhania University (SPSU). Your task is to analyze the student\'s profile against the job placement listing and provide a constructive match audit. Use markdown format. Include a Match Score (%), list strong points, specify exact gaps in skills or bio content, and provide a short, tailored professional bio recommendation. Keep it concise, helpful, and highly professional.'
          },
          {
            role: 'user',
            content: `STUDENT PROFILE:
Name: ${student.name}
Bio: ${student.bio}
Skills: ${JSON.stringify(student.skills)}
Grades (Semesters): ${JSON.stringify((student.toObject() as any).grades || [])}
Certificates: ${JSON.stringify((student.toObject() as any).certificates || [])}

PLACEMENT LISTING:
Title: ${listing.title}
Company: ${listing.company}
Description: ${listing.description}
Requirements: ${JSON.stringify(listing.requirements)}
Skills: ${JSON.stringify(listing.skills)}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const auditText = data.choices?.[0]?.message?.content?.trim();

    return res.json({
      success: true,
      auditText,
      matchScore: 75,
      simulated: false
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const chatAdvisor = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    const student = await UserProfileModel.findOne({ id: (req as any).user.id });
    if (!student) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Offline fallback advisor response
      const lowMsg = message.toLowerCase();
      let responseText = "I am currently running in **offline simulation mode**, but I'd be happy to guide you!\n\n";
      if (lowMsg.includes('cv') || lowMsg.includes('resume') || lowMsg.includes('bio')) {
        responseText += "Your professional bio should follow the **STAR structure**:\n* **Situation**: Explain the context.\n* **Task**: Detail the challenge.\n* **Action**: What did you do?\n* **Result**: Quantitative achievements.\n\nBe sure to link your GitHub profile and add verified skills in your **Profile** tab.";
      } else if (lowMsg.includes('interview') || lowMsg.includes('prep') || lowMsg.includes('prepare')) {
        responseText += "For technical interview prep at companies like Vercel or Stripe, prioritize:\n* `Data Structures` and algorithms.\n* `REST/GraphQL` API design patterns.\n* `Frontend performance` auditing and styling.\n* Basic backend `scalability architectures`.";
      } else if (lowMsg.includes('grade') || lowMsg.includes('gpa') || lowMsg.includes('semester')) {
        responseText += "Keep in mind that many placements require maintaining a consistent academic profile. Aim to:\n* Keep your semester GPA **above 6.5 or 7.0** to bypass automated criteria filters.\n* Optimize grades in core engineering modules.";
      } else {
        responseText += `As your SPSU Career Advisor, I see your registered skills are: **${(student.skills || []).join(', ') || 'none yet'}**.\n* Focus on building hands-on projects related to these tech stacks.\n* This will boost your match scores past the **60% placement thresholds**!`;
      }
      return res.json({
        success: true,
        reply: responseText,
        simulated: true
      });
    }

    // Format chat history for OpenAI compatibility
    const formattedMessages = [
      {
        role: 'system',
        content: `You are an elite, highly encouraging AI Career Advisor and Placement Officer at Sir Padampat Singhania University (SPSU). Your target is to guide students on how to prepare for jobs, review CV/resume components, improve grades, and suggest skills. 
        
        STUDENT BACKGROUND:
        Name: ${student.name}
        Bio: ${student.bio || 'None'}
        Skills: ${JSON.stringify(student.skills || [])}
        GPA history: ${JSON.stringify((student as any).grades || [])}
        Certifications: ${JSON.stringify((student as any).certificates || [])}
        
        Answer professionally. Keep responses concise, structured, and action-oriented.
        Use rich Markdown formatting for your responses:
        - Use **bolding** to highlight important points or action items.
        - Use bullet points (using * or -) to structure recommendations and lists.
        - Use \`inline code\` for tech terms, command line tools, database queries, and programming languages.`
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    return res.json({
      success: true,
      reply,
      simulated: false
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

