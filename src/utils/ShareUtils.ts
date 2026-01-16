import { Linking, Share } from 'react-native';
import { MediaScanner } from './MediaScanner';

const REPO_URL = 'https://github.com/Parad0x-Labs/parad0x-press';
const TWITTER_HANDLE = '@Parad0x_Labs';

const TWEET_TEMPLATES = [
    "🗜️ Just saved {SAVED} on my phone with Parad0x Press! My storage is {PERCENT}% lighter now. {LINK} Thanks {HANDLE}!",
    "📱 Before: Phone full. After: {SAVED} of free space! {HANDLE} built something insane. {LINK}",
    "🔥 {PHOTOS} photos + {VIDEOS} videos compressed. {SAVED} saved. Zero quality loss. {LINK} by {HANDLE}",
    "My phone just went on a diet and lost {SAVED} 💪 Thanks {HANDLE} for Parad0x Press! {LINK}",
    "Storage anxiety? Gone. {SAVED} freed up with one tap. {LINK} {HANDLE} you legends!",
    "🚀 Just compressed my entire gallery. {SAVED} saved at 99% quality. This is witchcraft. {LINK} {HANDLE}",
    "No more deleting memories! Parad0x Press gave me {SAVED} back. {LINK} Thank you {HANDLE}!",
    "Just hit compress and watched {SAVED} vanish from my storage usage. {HANDLE} is the future. {LINK}",
    "POV: You discover Parad0x Press and save {SAVED} in minutes. {LINK} {HANDLE} 🙌",
    "If your phone is full, you NEED this. {SAVED} saved. {PHOTOS} photos, {VIDEOS} videos, still perfect. {LINK} {HANDLE}",
    "Solana Seeker owners eating good with free access to this. {SAVED} saved! {LINK} {HANDLE}",
    "Just freed up {SAVED} on my Android. Parad0x Press is a game changer. {LINK} by {HANDLE}",
];

export interface ShareData {
    savedBytes: number;
    photoCount: number;
    videoCount: number;
    audioCount: number;
}

export const ShareUtils = {

    generateTweet(data: ShareData): string {
        const template = TWEET_TEMPLATES[Math.floor(Math.random() * TWEET_TEMPLATES.length)];
        const saved = MediaScanner.formatBytes(data.savedBytes);
        const percent = Math.round((data.savedBytes / (data.savedBytes + 1000000)) * 100);

        return template
            .replace('{SAVED}', saved)
            .replace('{PERCENT}', percent.toString())
            .replace('{PHOTOS}', data.photoCount.toString())
            .replace('{VIDEOS}', data.videoCount.toString())
            .replace('{LINK}', REPO_URL)
            .replace('{HANDLE}', TWITTER_HANDLE);
    },

    async shareToTwitter(data: ShareData): Promise<void> {
        const tweet = this.generateTweet(data);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;

        const canOpen = await Linking.canOpenURL(twitterUrl);
        if (canOpen) {
            await Linking.openURL(twitterUrl);
        } else {
            // Fallback to native share
            await Share.share({
                message: tweet,
                title: 'Share your savings!',
            });
        }
    },

    async shareGeneric(data: ShareData): Promise<void> {
        const tweet = this.generateTweet(data);
        await Share.share({
            message: tweet,
            title: 'Parad0x Press Savings',
        });
    }
};
