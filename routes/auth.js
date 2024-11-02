const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/signup', authController.signup);
//router.post('/assestmentsub', authController.submitAssessment);

router.post('/login', authController.login);
router.post('/addSpayneuter', authController.addSpayneuter);
router.post('/addadoption', authController.addAdoption);
router.post('/getUserProf', authController.getUserProfile);
router.put('/updateuser', authController.updateUserProfile);
router.get('/logout', authController.logout);
router.post('/api/adoptPet', authController.adoptPet);
router.post('/api/monitorpet', authController.monitoring);
router.get('/api/userprof',authController.getUserProfilepic)
// Pet-related routes


router.get('/getCount', authController.getCount);
//router.get('/getallAssesment', authController.getallAssesment);
router.get('/api/getalluser', authController.getalluser);
router.get('/clientsched', authController.getclientSched);
router.get('/adminsched', authController.getadminSched);
router.get('/api/pets', authController.getPendingPets);
router.put('/api/pets/:id/status', authController.updatePetStatus);
router.get('/api/pethistory', authController.getpetHistory);
router.get('/api/allpets', authController.getAllPets);
router.get('/api/allapprovedpets', authController.getAllapprovepets);
router.get('/api/allclientpets', authController.getAllclientpets);
router.get('/api/alladoptionAproved', authController.getAlladoptionapprovepets);
router.get('/api/alladminadoptionAproved', authController.getAlladminadoptpets);
router.post('/send-email', authController.sendEmail);
router.get('/reset-password/:token', authController.renderResetPasswordPage); 
router.post('/reset-password', authController.resetPassword); 
module.exports = router;
