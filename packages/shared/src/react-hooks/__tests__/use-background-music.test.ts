import { songList, getRandomSong } from "../use-background-music";
import { buildVersion } from "../../constants";
import { path as soundsPath } from "../use-sound";

describe("use-background-music", () => {
    const expectedBasePath = `${soundsPath}bg-music/`;

    describe("songList", () => {
        it("should generate correct list of 4 songs with proper paths and version", () => {
            // Arrange
            const expectedSongs = [
                `${expectedBasePath}song1.mp3?v=${buildVersion}`,
                `${expectedBasePath}song2.mp3?v=${buildVersion}`,
                `${expectedBasePath}song3.mp3?v=${buildVersion}`,
                `${expectedBasePath}song4.mp3?v=${buildVersion}`,
            ];

            // Assert
            expect(songList).toEqual(expectedSongs);
            expect(songList).toHaveLength(4);
        });
    });

    describe("getRandomSong", () => {
        it("should return a different song than the current one", () => {
            // Arrange
            const currentSong = `${expectedBasePath}song1.mp3?v=${buildVersion}`;

            // Act
            const result = getRandomSong(currentSong);

            // Assert
            expect(result).not.toBe(currentSong);
            expect(songList).toContain(result);
        });

        it("should return a song from the available list", () => {
            // Arrange
            const currentSong = `${expectedBasePath}song2.mp3?v=${buildVersion}`;

            // Act
            const result = getRandomSong(currentSong);

            // Assert
            expect(songList).toContain(result);
        });

        it("should maintain randomness across multiple calls", () => {
            // Arrange
            const currentSong = `${expectedBasePath}song1.mp3?v=${buildVersion}`;
            const results = new Set();
            const iterations = 100;

            // Act
            for (let i = 0; i < iterations; i++) {
                results.add(getRandomSong(currentSong));
            }

            // Assert
            // With enough iterations, we should get all possible songs
            expect(results.size).toBeGreaterThan(2); // We should at least get 3 different songs

            // Verify all results are valid songs
            results.forEach((song) => {
                expect(songList).toContain(song);
                expect(song).not.toBe(currentSong);
            });
        });

        it("should handle edge case when current song is not in the list", () => {
            // Arrange
            const invalidSong = `${expectedBasePath}nonexistent.mp3?v=${buildVersion}`;

            // Act
            const result = getRandomSong(invalidSong);

            // Assert
            expect(songList).toContain(result);
        });
    });
});
