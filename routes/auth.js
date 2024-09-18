const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/signup', authController.signup);
router.post('/assestmentsub', authController.submitAssessment);

router.post('/login', authController.login);
router.post('/addPet', authController.addPet);
router.post('/getUserProf', authController.getUserProfile);
router.put('/updateuser', authController.updateUserProfile);
router.get('/logout', authController.logout);
router.post('/adoptPet', authController.adoptPet);
router.post('/api/monitorpet', authController.monitoring);
router.get('/api/userprof',authController.getUserProfilepic)
// Pet-related routes
router.get('/api/pets', authController.getPendingPets);
router.put('/api/pets/:id/status', authController.updatePetStatus);
router.get('/api/allpets', authController.getAllPets);
router.get('/api/allapprovedpets', authController.getAllapprovepets);
router.get('/api/allclientpets', authController.getAllclientpets);
router.get('/api/alladoptionAproved', authController.getAlladoptionapprovepets);
router.get('/api/alladminadoptionAproved', authController.getAlladminadoptpets);
module.exports = router;
