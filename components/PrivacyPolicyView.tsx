import React from 'react';

const PrivacyPolicyView: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-4xl mx-auto">
            <div className="border-b border-slate-200 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Privacy Policy</h1>
                <p className="text-sm text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-lg max-w-none text-slate-700 space-y-4">
                <p>Welcome to KTK Connect. We are committed to protecting your privacy. This Privacy Policy explains what personal data we collect, how we use it, and what rights you have in relation to it.</p>

                <h2 className="text-xl font-semibold text-slate-800">1. Data We Collect</h2>
                <p>We collect the following types of information to provide and improve our services:</p>
                <ul>
                    <li><strong>Account Information:</strong> Your name, avatar, and internal member ID.</li>
                    <li><strong>Financial Information:</strong> Your wallet balance and transaction history for court bookings and lessons. We do not store credit card details.</li>
                    <li><strong>Usage Data:</strong> Information about your activity on the app, such as court bookings, lesson bookings, event attendance, ladder challenges, and partner requests.</li>
                    <li><strong>User-Generated Content:</strong> Posts, comments, and videos you share on the Community wall, and messages sent in Groups.</li>
                    <li><strong>AI Coach Interactions:</strong> The questions you ask our AI Coach and the conversation history. This data is used to provide the coaching service and is processed by Google's Gemini API.</li>
                    <li><strong>Federation Data (with consent):</strong> If you consent, we share your name and NTF ID with the Norwegian Tennis Federation (NTF) for official verification purposes.</li>
                </ul>

                <h2 className="text-xl font-semibold text-slate-800">2. How We Use Your Data</h2>
                <p>Your data is used for the following purposes:</p>
                <ul>
                    <li>To operate and maintain the KTK Connect app and its features.</li>
                    <li>To manage your account, bookings, and payments.</li>
                    <li>To facilitate communication and interaction between club members.</li>
                    <li>To provide personalized services like the AI Coach.</li>
                    <li>To send you important notifications about club activities, announcements, and your interactions within the app.</li>
                    <li>To analyze usage to improve the app's functionality and user experience.</li>
                </ul>

                <h2 className="text-xl font-semibold text-slate-800">3. Data Sharing and Storage</h2>
                <p>We take your privacy seriously. We do not sell your personal data. We may share data with:</p>
                <ul>
                    <li><strong>Google's Gemini API:</strong> For the AI Coach feature. Your prompts and conversation history are sent to Google for processing.</li>
                    <li><strong>Norwegian Tennis Federation:</strong> Only with your explicit consent, for membership verification.</li>
                </ul>
                <p>All your data is stored securely. We take reasonable measures to protect your information from unauthorized access or disclosure.</p>

                <h2 className="text-xl font-semibold text-slate-800">4. Your Rights</h2>
                <p>Under GDPR, you have the following rights regarding your personal data:</p>
                <ul>
                    <li><strong>Right to Access:</strong> You can request a copy of the data we hold about you.</li>
                    <li><strong>Right to Rectification:</strong> You can correct inaccurate personal data. You can edit your name directly in the "My Account" section.</li>
                    <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You can request that we delete your personal data. This can be done via the "Delete My Account" option in the "My Account" section. Please note that this action is irreversible and will remove all your data from our systems.</li>
                    <li><strong>Right to Withdraw Consent:</strong> You can withdraw your consent for data processing (e.g., for NTF data sharing) at any time in the "My Account" section.</li>
                </ul>

                 <h2 className="text-xl font-semibold text-slate-800">5. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact the club administration.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
